"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Clock } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

export interface ResidentNotif {
  id: number | string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category?: string;
}

const INITIAL_NOTIFS: ResidentNotif[] = [
  {
    id: 1,
    title: "New Case Escalated",
    message: "Case #C-2045 has been escalated for admin review.",
    time: "5m ago",
    read: false,
  },
  {
    id: 2,
    title: "Officer Assignment Updated",
    message: "Officer Dela Cruz was assigned to your mediation request.",
    time: "22m ago",
    read: false,
  },
  {
    id: 3,
    title: "Daily Report Ready",
    message: "The daily incident summary is now available.",
    time: "1h ago",
    read: false,
  },
];

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
  const [notifs, setNotifs] = useState<ResidentNotif[]>(INITIAL_NOTIFS);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });
  const ref = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition({
      top: rect.bottom + 8,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  }, []);

  const loadNotifications = useCallback(() => {
    const user = getAuthUser();
    if (!user) {
      return;
    }

    fetch(`/api/resident/notifications?email=${encodeURIComponent(user.email)}&limit=3`)
      .then((response) => response.json())
      .then((result) => {
        setNotifs(result.success ? result.data : loadNotifs());
      })
      .catch(() => setNotifs(loadNotifs()));
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useSupabaseRealtime(["notifications"], loadNotifications);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  const unread = notifs.filter((n) => !n.read).length;
  const recent = notifs.slice(0, 3);

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifs(updated);
    const user = getAuthUser();
    if (user) {
      fetch("/api/resident/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      }).catch(() => undefined);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          updateMenuPosition();
          setOpen((v) => !v);
        }}
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
        <div
          className="fixed z-[100] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-xl shadow-black/10"
          style={{ top: menuPosition.top, right: menuPosition.right }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Recent activity only</p>
            </div>
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="px-2 py-2">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent
            </p>
            {recent.map((n) => (
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
