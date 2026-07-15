"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  Send,
  Brain,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Loader2,
  FileText,
  Sparkles,
  PanelRight,
  Menu,
  User,
} from "lucide-react";
import { colorForKey, deriveTopic } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

type Source = { id: string; title: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };
type Chat = { id: string; title: string; pinned: boolean; createdAt: number; messages: Msg[] };

const STORAGE_KEY = "mnemo:chats";
const SUGGESTIONS = [
  "Summarize everything I know about my top topic",
  "What connections am I missing between my ideas?",
  "Quiz me on something I learned recently",
  "Explain my weakest topic in simple terms",
];

export function ChatWorkspace({ hasMemories }: { hasMemories: boolean }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Chat[] = JSON.parse(raw);
        setChats(parsed);
        if (parsed[0]) setCurrentId(parsed[0].id);
      }
    } catch {}
  }, []);

  const persist = (next: Chat[]) => {
    setChats(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const current = chats.find((c) => c.id === currentId) || null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [current?.messages, typing, loading]);

  function newChat() {
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: "New chat",
      pinned: false,
      createdAt: Date.now(),
      messages: [],
    };
    persist([chat, ...chats]);
    setCurrentId(chat.id);
    setMobileNav(false);
  }

  function updateChat(id: string, fn: (c: Chat) => Chat) {
    persist(chats.map((c) => (c.id === id ? fn(c) : c)));
  }

  function deleteChat(id: string) {
    const next = chats.filter((c) => c.id !== id);
    persist(next);
    if (currentId === id) setCurrentId(next[0]?.id || null);
  }

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    let chatId = currentId;
    let base = chats;
    if (!chatId) {
      const chat: Chat = {
        id: crypto.randomUUID(),
        title: message.slice(0, 40),
        pinned: false,
        createdAt: Date.now(),
        messages: [],
      };
      base = [chat, ...chats];
      chatId = chat.id;
      setCurrentId(chatId);
    }

    const userMsg: Msg = { role: "user", content: message };
    const withUser = base.map((c) =>
      c.id === chatId
        ? {
            ...c,
            title: c.messages.length === 0 ? message.slice(0, 40) : c.title,
            messages: [...c.messages, userMsg],
          }
        : c
    );
    persist(withUser);
    setInput("");
    setLoading(true);

    try {
      const history = (withUser.find((c) => c.id === chatId)?.messages || [])
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      // typewriter reveal
      const reply: string = data.reply;
      setLoading(false);
      setTyping("");
      const words = reply.split(" ");
      let acc = "";
      for (let i = 0; i < words.length; i++) {
        acc += (i ? " " : "") + words[i];
        setTyping(acc);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 12));
      }
      setTyping(null);

      const assistant: Msg = { role: "assistant", content: reply, sources: data.sources };
      setChats((prev) => {
        const next = prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, assistant] } : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setLoading(false);
      setTyping(null);
      const assistant: Msg = {
        role: "assistant",
        content:
          err instanceof Error
            ? `⚠️ ${err.message}`
            : "⚠️ Something went wrong. Please try again.",
      };
      setChats((prev) => {
        const next = prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, assistant] } : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }

  const grouped = useMemo(() => {
    const today: Chat[] = [];
    const previous: Chat[] = [];
    const pinned: Chat[] = [];
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    for (const c of chats) {
      if (c.pinned) pinned.push(c);
      else if (c.createdAt >= startOfToday) today.push(c);
      else previous.push(c);
    }
    return { pinned, today, previous };
  }, [chats]);

  const contextSources = useMemo(() => {
    if (!current) return [];
    const map = new Map<string, Source>();
    for (const m of current.messages) {
      m.sources?.forEach((s) => map.set(s.id, s));
    }
    return Array.from(map.values());
  }, [current]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Sessions sidebar */}
      <ChatSidebar
        grouped={grouped}
        currentId={currentId}
        onSelect={(id) => {
          setCurrentId(id);
          setMobileNav(false);
        }}
        onNew={newChat}
        onPin={(id) => updateChat(id, (c) => ({ ...c, pinned: !c.pinned }))}
        onDelete={deleteChat}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
      />

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <button
            onClick={() => setMobileNav(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 truncate">
            <MessageSquare className="h-4 w-4 text-mnemo-primary" />
            <span className="truncate text-sm font-medium text-white">
              {current?.title || "AI Chat"}
            </span>
          </div>
          <button
            onClick={() => setShowContext((v) => !v)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border text-white transition-colors",
              showContext ? "border-mnemo-primary/40 bg-mnemo-primary/10" : "border-white/10"
            )}
            aria-label="Toggle memory context"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!current || current.messages.length === 0 ? (
            <EmptyChat hasMemories={hasMemories} onPick={(s) => send(s)} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              {current.messages.map((m, i) => (
                <Message key={i} msg={m} />
              ))}
              {typing != null && (
                <Message msg={{ role: "assistant", content: typing }} />
              )}
              {loading && (
                <div className="flex gap-3">
                  <Avatar assistant />
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-mnemo-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2 focus-within:border-mnemo-primary/40">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask your second brain anything…"
                className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-mnemo-muted focus:outline-none"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black transition-all hover:shadow-[0_0_20px_-4px_rgba(255,255,255,0.6)] disabled:opacity-40 disabled:hover:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-mnemo-muted">
              Mnemo answers using your captured memories. Responses may be imperfect.
            </p>
          </div>
        </div>
      </div>

      {/* Memory context */}
      <AnimatePresence>
        {showContext && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden shrink-0 overflow-hidden border-l border-white/[0.06] bg-[#0a0a0a] lg:block"
          >
            <div className="w-72 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mnemo-primary" />
                <h3 className="text-sm font-semibold text-white">Memory context</h3>
              </div>
              <p className="mt-1 text-xs text-mnemo-muted">
                Memories Mnemo is drawing from in this chat.
              </p>
              <div className="mt-4 space-y-2">
                {contextSources.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-mnemo-muted">
                    Sources will appear here as you chat.
                  </div>
                ) : (
                  contextSources.map((s) => {
                    const topic = deriveTopic(s.title);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${colorForKey(topic)}1f`, color: colorForKey(topic) }}
                        >
                          <FileText className="h-4 w-4" />
                        </span>
                        <span className="truncate text-xs font-medium text-white">{s.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatSidebar({
  grouped,
  currentId,
  onSelect,
  onNew,
  onPin,
  onDelete,
  mobileOpen,
  onCloseMobile,
}: {
  grouped: { pinned: Chat[]; today: Chat[]; previous: Chat[] };
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const body = (
    <div className="flex h-full w-64 flex-col bg-[#0a0a0a]">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_20px_-6px_rgba(255,255,255,0.5)]"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <ChatGroup label="Pinned" chats={grouped.pinned} {...{ currentId, onSelect, onPin, onDelete }} />
        <ChatGroup label="Today" chats={grouped.today} {...{ currentId, onSelect, onPin, onDelete }} />
        <ChatGroup label="Previous" chats={grouped.previous} {...{ currentId, onSelect, onPin, onDelete }} />
        {grouped.pinned.length + grouped.today.length + grouped.previous.length === 0 && (
          <p className="px-3 pt-6 text-center text-xs text-mnemo-muted">No chats yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden shrink-0 border-r border-white/[0.06] lg:block">{body}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 border-r border-white/[0.06] lg:hidden"
            >
              {body}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatGroup({
  label,
  chats,
  currentId,
  onSelect,
  onPin,
  onDelete,
}: {
  label: string;
  chats: Chat[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (chats.length === 0) return null;
  return (
    <div>
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-mnemo-muted/60">
        {label}
      </p>
      <div className="space-y-0.5">
        {chats.map((c) => (
          <div
            key={c.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              currentId === c.id ? "bg-white/[0.06] text-white" : "text-mnemo-muted hover:text-white"
            )}
          >
            <button onClick={() => onSelect(c.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{c.title}</span>
            </button>
            <button
              onClick={() => onPin(c.id)}
              className="shrink-0 text-mnemo-muted opacity-0 hover:text-white group-hover:opacity-100"
              aria-label="Pin chat"
            >
              {c.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="shrink-0 text-mnemo-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
              aria-label="Delete chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Message({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar assistant={!isUser} />
      <div className={cn("min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-mnemo-primary text-white"
              : "rounded-tl-sm border border-white/[0.06] bg-white/[0.02] text-white/90"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <Markdown content={msg.content} />
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.sources.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] text-mnemo-muted"
              >
                <FileText className="h-2.5 w-2.5" /> {s.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Avatar({ assistant }: { assistant?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        assistant ? "bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]" : "bg-white/10"
      )}
    >
      {assistant ? <Brain className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
    </span>
  );
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="space-y-3 [&_a]:text-mnemo-accent [&_a]:underline [&_li]:ml-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          h1: ({ children }) => <h1 className="text-base font-semibold text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-white">{children}</h3>,
          code: ({ className, children }) => {
            const isBlock = (className || "").includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg border border-white/[0.08] bg-black/50 p-3 font-mono text-xs text-white/90">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-mnemo-accent">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-left font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/10 px-2.5 py-1.5 text-white/80">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-mnemo-primary/50 pl-3 text-mnemo-muted">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function EmptyChat({
  hasMemories,
  onPick,
}: {
  hasMemories: boolean;
  onPick: (s: string) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8] shadow-glow-primary">
        <Brain className="h-7 w-7 text-white" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-white">Chat with your brain</h2>
      <p className="mt-1.5 text-sm text-mnemo-muted">
        {hasMemories
          ? "Ask anything — Mnemo answers using your captured memories."
          : "Capture a few memories first, then ask Mnemo anything about them."}
      </p>
      {hasMemories && (
        <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-left text-sm text-white/80 transition-colors hover:border-white/20 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
