"use client";
export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Send,
  Shield,
  User,
} from "lucide-react";
import { getAuthUser, getRoleLandingPath, isRoleAuthorized } from "@/lib/auth";
import { BpatSidebar } from "@/components/bpat/sidebar";
import { PageHeader } from "@/components/ui/page-header";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { EvidenceViewer } from "@/components/cases/evidence-viewer";
import type { EvidenceFile } from "@/lib/types";

interface ChatMessage {
  id: string;
  from: "officer" | "complainant";
  text: string;
  time: string;
}

interface CaseThread {
  caseId: string;
  caseNumber: string;
  title: string;
  complainant: string;
  street: string;
  status: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
  evidenceFiles: EvidenceFile[];
}

export default function CaseChatPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<CaseThread[]>([]);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadThreads = useCallback(() => {
    const user = getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isRoleAuthorized(["bpat"])) {
      router.push(getRoleLandingPath(user.role));
      return;
    }

    setUserEmail(user.email);
    fetch(`/api/bpat-officers/chat?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) setThreads(result.data);
      })
      .catch(() => undefined);
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(loadThreads, 0);
    return () => window.clearTimeout(timeout);
  }, [loadThreads]);

  useSupabaseRealtime(["cases", "case_chat_messages"], loadThreads);

  const activeThread = threads.find((thread) => thread.caseId === activeCase) ?? null;
  const activeMessageCount = activeThread?.messages.length;
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(threads.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedThreads = threads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (!activeThread) return;

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    if (activeThread.unread > 0) {
      Promise.resolve().then(() => {
        setThreads((prev) =>
          prev.map((thread) => (thread.caseId === activeCase ? { ...thread, unread: 0 } : thread))
        );
      });
    }
  }, [activeCase, activeMessageCount, activeThread]);

  const sendMessage = async () => {
    if (!input.trim() || !activeCase) return;
    const message = input.trim();
    setInput("");
    inputRef.current?.focus();

    const response = await fetch("/api/bpat-officers/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: activeCase,
        email: userEmail,
        message,
      }),
    });
    const result = await response.json();
    if (!result.success || !result.data) return;

    setThreads((prev) =>
      prev.map((thread) =>
        thread.caseId === activeCase ? result.data : thread
      )
    );
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const totalUnread = threads.reduce((sum, thread) => sum + thread.unread, 0);

  if (activeThread) {
    return (
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <div className="hidden lg:flex h-screen shrink-0">
          <BpatSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex-shrink-0 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-4 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
            <div className="mx-auto w-full max-w-md">
              <button
                onClick={() => setActiveCase(null)}
                className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-foreground)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Cases
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{activeThread.complainant}</p>
                  <p className="truncate text-xs text-[var(--sidebar-muted)]">
                    #{activeThread.caseNumber} · {activeThread.street}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                  {activeThread.status}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-0 sm:p-0 lg:p-8">
            <div className="hidden lg:block px-4 sm:px-6 lg:px-0">
              <PageHeader
                title="Case Chat"
                description={`Conversation with ${activeThread.complainant} for case #${activeThread.caseNumber}.`}
                icon={<MessageSquare className="h-5 w-5 text-white" />}
                actionSlot={
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    {activeThread.status}
                  </span>
                }
              />
            </div>

            <div className="mx-auto flex h-full w-full max-w-md flex-col lg:max-w-5xl lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:shadow-sm">
              <div className="flex-shrink-0 border-b border-border bg-muted/40 px-4 py-2">
                <div className="mx-auto w-full max-w-md">
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Case:</span> {activeThread.title}
                  </p>
                </div>
              </div>

              {activeThread.evidenceFiles?.length > 0 && (
                <div className="flex-shrink-0 border-b border-border bg-background px-4 py-2">
                  <div className="mx-auto flex w-full max-w-md gap-2 overflow-x-auto">
                    {activeThread.evidenceFiles.map((file, index) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setActiveEvidenceIndex(index)}
                        className="inline-flex max-w-[220px] shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-xs hover:bg-muted"
                      >
                        <FileText className="h-4 w-4 text-[var(--primary)]" />
                        <span className="min-w-0 truncate">{file.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mx-auto w-full max-w-md space-y-3">
                  {activeThread.messages.map((message) => {
                    const isOfficer = message.from === "officer";
                    return (
                      <div key={message.id} className={`flex gap-2 ${isOfficer ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isOfficer ? "bg-[var(--primary)]" : "bg-muted"}`}>
                          {isOfficer ? (
                            <Shield className="h-4 w-4 text-white" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className={`flex max-w-[75%] flex-col gap-1 ${isOfficer ? "items-end" : "items-start"}`}>
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                              isOfficer
                                ? "rounded-tr-sm bg-[var(--primary)] text-white"
                                : "rounded-tl-sm border border-border bg-card text-foreground"
                            }`}
                          >
                            {message.text}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{message.time}</span>
                        </div>
                      </div>
                    );
                  })}
                  {activeThread.messages.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center text-xs text-muted-foreground">
                      No messages yet.
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
                <div className="mx-auto flex w-full max-w-md items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Reply to ${activeThread.complainant}...`}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition hover:bg-[var(--primary-hover)] disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                  Messages are logged and visible to barangay admin
                </p>
              </div>
            </div>
          </main>
          {activeEvidenceIndex !== null && (
            <EvidenceViewer
              files={activeThread.evidenceFiles}
              initialIndex={activeEvidenceIndex}
              onClose={() => setActiveEvidenceIndex(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex h-screen shrink-0">
        <BpatSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-[var(--sidebar-bg)] px-4 pb-5 pt-4 text-[var(--sidebar-foreground)] shadow-sm lg:hidden">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/bpat-officers"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-foreground)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Field Ops
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--sidebar-muted)]">BPAT Mobile Desk</p>
                <h1 className="mt-1 text-xl font-bold">Case Chat</h1>
              </div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <MessageSquare className="h-5 w-5" />
                {totalUnread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:block">
            <PageHeader
              title="Case Chat"
              description="Open a thread with complainants and document responses in real time."
              icon={<MessageSquare className="h-5 w-5 text-white" />}
              actionSlot={
                totalUnread > 0 ? (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    {totalUnread} unread
                  </span>
                ) : null
              }
            />
          </div>

          <div className="mx-auto w-full max-w-md space-y-3 lg:max-w-6xl lg:space-y-6">
            <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Select a case below to open a chat with the complainant. All messages are logged and visible to barangay admin.
              </p>
            </div>

            {threads.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-muted-foreground">No assigned case chats found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pagedThreads.map((thread) => (
                  <button
                    key={thread.caseNumber}
                    onClick={() => setActiveCase(thread.caseId)}
                    className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-[var(--primary)]/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                        <User className="h-5 w-5 text-[var(--primary)]" />
                        {thread.unread > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {thread.unread}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-foreground">{thread.complainant}</p>
                          <span className="flex-shrink-0 text-[11px] text-muted-foreground">{thread.lastTime}</span>
                        </div>
                        <p className="text-xs font-semibold text-[var(--primary)]">#{thread.caseNumber}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{thread.lastMessage}</p>
                      </div>

                      <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                    </div>

                    <div className="mt-2.5 flex items-center gap-2 pl-[52px]">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {thread.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{thread.street}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {threads.length > pageSize && (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
