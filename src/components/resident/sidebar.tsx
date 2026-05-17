"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  Home,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: "Home", href: "/resident", icon: <Home className="h-5 w-5" /> },
  { label: "Report Intake", href: "/resident/report-intake", icon: <Plus className="h-5 w-5" /> },
  { label: "My Cases", href: "/resident/cases", icon: <ClipboardList className="h-5 w-5" /> },
  { label: "Announcements", href: "/resident/reports", icon: <Megaphone className="h-5 w-5" /> },
  { label: "Updates", href: "/resident/updates", icon: <Bell className="h-5 w-5" /> },
  { label: "Help Center", href: "/resident/operations", icon: <LifeBuoy className="h-5 w-5" /> },
  { label: "Account", href: "/resident/account", icon: <User className="h-5 w-5" /> },
];

export function ResidentSidebar() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.clear();

    toast({
      title: "Goodbye!",
      description: "You have been successfully logged out.",
      variant: "success",
    });

    setTimeout(() => {
      router.push("/login");
    }, 600);
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileOpen && !target.closest("aside") && !target.closest("[data-mobile-menu-trigger]")) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileOpen]);

  function isActive(href: string) {
    if (href === "/resident") return pathname === "/resident";
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between px-4 sm:px-6 pb-6 pt-4 sm:pt-6 lg:pt-8">
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
              <img
                src="/EastTapinac.png"
                alt="Barangay East Tapinac"
                className="h-12 w-12 rounded-md"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wide text-[var(--sidebar-icon)]">
                  IRIS
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--sidebar-icon)]/80">
                  Resident Portal
                </span>
              </div>
            </>
          )}
        </div>
        {!isMinimized && (
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hidden sm:flex shrink-0 rounded-lg border-2 border-[var(--sidebar-primary)] bg-[var(--sidebar-primary)] p-1.5 transition-colors hover:opacity-90"
            title="Minimize"
          >
            <PanelRightClose className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
          </button>
        )}
        {!isMinimized && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex sm:hidden shrink-0 rounded-lg border-2 border-[var(--sidebar-primary)] bg-[var(--sidebar-primary)] p-1.5 transition-colors hover:opacity-90 lg:hidden"
            title="Close menu"
          >
            <X className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 sm:px-4">
        <ul className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-nav-hover-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)]",
                  isActive(item.href)
                    ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-foreground)] shadow-sm"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-nav-hover-bg)] hover:text-[var(--sidebar-nav-hover-foreground)]"
                )}
              >
                <span className="text-current">{item.icon}</span>
                {!isMinimized && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-3 sm:px-4 pb-5">
      {!isMinimized && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-2 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5",
                "text-sm font-semibold transition-all duration-200",

                // red danger style
                "bg-red-700 hover:bg-red-800",
                "shadow-sm hover:shadow-md",

                // focus accessibility
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
        </div>
      )}
    </div>
    </>
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-[var(--sidebar-bg)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[var(--sidebar-icon)] bg-[var(--sidebar-bg)] font-sans text-sm font-bold text-[var(--sidebar-icon)]">
            I
          </div>
          <span className="text-base font-bold tracking-wide text-[var(--sidebar-icon)]">
            IRIS
          </span>
        </div>
        <button
          data-mobile-menu-trigger
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--sidebar-primary)] bg-[var(--sidebar-primary)] transition-colors hover:opacity-90"
          title="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
          ) : (
            <Menu className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
          )}
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex h-screen max-h-screen shrink-0 flex-col overflow-y-auto transition-all duration-300",
          "lg:sticky lg:top-0",
          isMobileOpen ? "w-64" : "-translate-x-full lg:translate-x-0",
          isMinimized ? "lg:w-20" : "lg:w-64",
          "bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)]",
          "hidden lg:flex"
        )}
      >
        <SidebarContent />
      </aside>

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex w-64 shrink-0 flex-col transition-all duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)]",
          "lg:hidden"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
