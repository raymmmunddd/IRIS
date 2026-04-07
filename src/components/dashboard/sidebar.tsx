"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Cases", href: "/cases", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Operations", href: "/operations", icon: <Users className="h-5 w-5" /> },
  { label: "Reports", href: "/reports", icon: <FileText className="h-5 w-5" /> },
  { label: "Administration", href: "/admin", icon: <ShieldCheck className="h-5 w-5" /> },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isMinimized, setIsMinimized] = useState(false)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col transition-all duration-300",
        isMinimized ? "w-20" : "w-64",
        "bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)]"
      )}
    >
      {/* Logo with Menu Button */}
      <div className="flex items-center justify-between px-6 pb-6 pt-6 lg:pt-8">
        <div className="flex items-center gap-2">
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--sidebar-icon)] bg-[var(--sidebar-bg)] text-[var(--sidebar-icon)]"
              title="Expand"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--sidebar-icon)] bg-[var(--sidebar-bg)] font-sans text-lg font-bold text-[var(--sidebar-icon)]">
                I
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wide text-[var(--sidebar-icon)]">
                  IRIS
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--sidebar-icon)]/80">
                  Admin Portal
                </span>
              </div>
            </>
          )}
        </div>
        {!isMinimized && (
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="shrink-0 rounded-lg border-2 border-[var(--sidebar-primary)] bg-[var(--sidebar-primary)] p-1.5 transition-colors hover:opacity-90"
            title="Minimize"
          >
            <PanelRightClose className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4">
        <ul className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-nav-hover-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)]",
                  isActive(item.href)
                    ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-foreground)] shadow-sm"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-nav-hover-bg)] hover:text-[var(--sidebar-nav-hover-foreground)]"
                )}
              >
                <span className="text-current">
                  {item.icon}
                </span>
                {!isMinimized && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 pb-6" />
    </aside>
  )
}
