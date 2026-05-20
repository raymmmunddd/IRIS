type QueueEntry<T> = {
  name: string
  task: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

const globalForQueue = globalThis as unknown as {
  irisTaskQueue?: QueueEntry<unknown>[]
  irisTaskQueueRunning?: boolean
}

const queue = globalForQueue.irisTaskQueue ?? []
globalForQueue.irisTaskQueue = queue

async function drainQueue() {
  if (globalForQueue.irisTaskQueueRunning) return

  globalForQueue.irisTaskQueueRunning = true
  try {
    while (queue.length > 0) {
      const entry = queue.shift()
      if (!entry) continue

      try {
        entry.resolve(await entry.task())
      } catch (error) {
        console.error(`[queue:${entry.name}] failed`, error)
        entry.reject(error)
      }
    }
  } finally {
    globalForQueue.irisTaskQueueRunning = false
  }
}

export function enqueueTask<T>(name: string, task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    queue.push({ name, task, resolve: resolve as (value: unknown) => void, reject })
    void drainQueue()
  })
}
