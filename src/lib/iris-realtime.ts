import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export type IrisRefreshTopic = "iris:cases" | "iris:notifications" | "iris:chat"
export type IrisRefreshSignal = "change" | "reconnected" | "connection-error"

type RefreshListener = (signal: IrisRefreshSignal) => void

const listenersByTopic = new Map<IrisRefreshTopic, Set<RefreshListener>>()
const channelsByTopic = new Map<IrisRefreshTopic, RealtimeChannel>()
const connectedTopics = new Set<IrisRefreshTopic>()
const removalTimersByTopic = new Map<IrisRefreshTopic, ReturnType<typeof setTimeout>>()

function notifyTopic(topic: IrisRefreshTopic, signal: IrisRefreshSignal) {
  listenersByTopic.get(topic)?.forEach((listener) => listener(signal))
}

export function subscribeToIrisRefresh(topic: IrisRefreshTopic, listener: RefreshListener) {
  const client = supabase
  if (!client) return () => undefined

  const listeners = listenersByTopic.get(topic) ?? new Set<RefreshListener>()
  listeners.add(listener)
  listenersByTopic.set(topic, listeners)
  const removalTimer = removalTimersByTopic.get(topic)
  if (removalTimer) {
    clearTimeout(removalTimer)
    removalTimersByTopic.delete(topic)
  }

  if (!channelsByTopic.has(topic)) {
    const channel = client
      .channel(topic, { config: { private: false, broadcast: { self: false } } })
      .on("broadcast", { event: "refresh" }, () => notifyTopic(topic, "change"))
    channelsByTopic.set(topic, channel)
    channel.subscribe((status) => {
      if (!listenersByTopic.get(topic)?.size) return
      if (status === "SUBSCRIBED") {
        const reconnected = connectedTopics.has(topic)
        connectedTopics.add(topic)
        if (reconnected) notifyTopic(topic, "reconnected")
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        notifyTopic(topic, "connection-error")
      }
    })
  }

  let active = true
  return () => {
    if (!active) return
    active = false
    const currentListeners = listenersByTopic.get(topic)
    currentListeners?.delete(listener)
    if (currentListeners?.size) return

    const timer = setTimeout(() => {
      removalTimersByTopic.delete(topic)
      if (listenersByTopic.get(topic)?.size) return
      listenersByTopic.delete(topic)
      connectedTopics.delete(topic)
      const channel = channelsByTopic.get(topic)
      if (!channel) return
      channelsByTopic.delete(topic)
      void client.removeChannel(channel)
    }, 0)
    removalTimersByTopic.set(topic, timer)
  }
}
