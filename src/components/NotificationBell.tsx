"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Clock } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export interface ResidentNotif {
  id: number | string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category?: string;
}

const INITIAL_NOTIFS: ResidentNotif[] = [];

const STORAGE_KEY = "iris_resident_notifs";

function loadNotifs(): ResidentNotif[] {
  if (typeof window === "undefined") return INITIAL_NOTIFS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_NOTIFS;
  } catch {
    return INITIAL_NOTIFS;
  }
}

function saveNotifs(notifs: ResidentNotif[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  } catch {
    // silent
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<ResidentNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasLoadedNotifications = useRef(false);

  const hasUser = Boolean(getAuthUser());

  useEffect(() => {
    if (!hasUser) setLoading(false);
  }, [hasUser]);

  useRealtimeRefresh(async (signal) => {
    const user = getAuthUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/resident/notifications?email=${encodeURIComponent(user.email)}&limit=3`, { signal });
      const result = await response.json();
      if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error(result.message || "Unable to load notifications.");
      setNotifs(result.data);
      hasLoadedNotifications.current = true;
      setLoadError("");
    } catch (error) {
      if (!signal.aborted && !hasLoadedNotifications.current) setLoadError(error instanceof Error ? error.message : "Unable to load notifications.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, { topics: ["iris:notifications"], enabled: hasUser });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const recent = notifs.slice(0, 3);

  const markAllRead = async () => {
    const user = getAuthUser();
    if (user) {
      setIsUpdating(true);
      setLoadError("");
      try {
        const response = await fetch("/api/resident/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to update notifications.");
        setNotifs((current) => current.map((notification) => ({ ...notification, read: true })));
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to update notifications.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur transition hover:bg-white/25"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-white" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Recent activity only</p>
            </div>
            <button
              onClick={markAllRead}
              disabled={isUpdating || unread === 0}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              {isUpdating ? "Updating..." : "Mark all read"}
            </button>
          </div>

          {/* List */}
          <div className="px-2 py-2">
            {loadError && <p role="alert" className="p-2 text-xs text-destructive">{loadError}</p>}
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent
            </p>
            {loading ? <div aria-label="Loading notifications" className="h-16 animate-pulse rounded-lg bg-muted" /> : recent.length === 0 ? <p className="px-2 py-4 text-xs text-muted-foreground">No notifications yet.</p> : recent.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted ${
                  !n.read ? "bg-[var(--primary)]/5" : ""
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                  <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-3">
            <Link
              href="/resident/updates"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-foreground hover:text-[var(--primary)] transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export { loadNotifs, saveNotifs, INITIAL_NOTIFS };
