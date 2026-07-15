"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, User, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ id: string; title: string }>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history = messages.slice(-10);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="flex-1 border-mnemo-border bg-mnemo-surface shadow-none flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && (
            <div className="text-center text-sm text-mnemo-muted mt-10">
              Ask a question about something you&apos;ve learned.
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
              {message.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-mnemo-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "items-end" : ""}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-mnemo-primary text-white rounded-br-md"
                      : "bg-mnemo-background border border-mnemo-border rounded-bl-md text-mnemo-text"
                  }`}
                >
                  {message.content}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source) => (
                      <span
                        key={source.id}
                        className="text-xs px-2 py-1 rounded-full bg-mnemo-background border border-mnemo-border text-mnemo-muted"
                      >
                        {source.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-mnemo-accent flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-mnemo-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-mnemo-background border border-mnemo-border text-sm text-mnemo-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-mnemo-border p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 h-11 bg-mnemo-background border-mnemo-border rounded-full px-4 focus-visible:ring-mnemo-accent"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-full bg-mnemo-primary hover:bg-mnemo-primary/90 text-white p-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
