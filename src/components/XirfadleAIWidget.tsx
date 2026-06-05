"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function XirfadleAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Asc! Magacaygu waa Xirfadle AI 🤖\nWaxaan ahay macallinkaaga AI — wax su'aal ah iiga weydii waxbarashadaada digital-ka!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "Waan ka xumahay, haddii aad dib u isku daydid. Xirfadle AI wuu diyaar kuu yahay inuu ku caawiyo su'aalahaaga.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Khalad ayaa dhacay. Fadlan dib u isku day ama la xiriir taageerada.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={`mb-4 flex w-[340px] flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[0_10px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-500 sm:w-[380px] ${
          isOpen
            ? "h-[500px] opacity-100 pointer-events-auto translate-y-0"
            : "h-0 opacity-0 pointer-events-none translate-y-4"
        }`}
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--silver-border)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-heading text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Xirfadle AI
            </h4>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your AI Mentor — Ask anything about your studies</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/40 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "bot"
                  ? "self-start rounded-bl-sm border bg-white/5"
                  : "self-end rounded-br-sm"
              }`}
              style={
                msg.role === "bot"
                  ? { borderColor: 'var(--silver-border)', color: 'var(--text-primary)' }
                  : { backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }
              }
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="self-start rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
              <span className="animate-pulse">Xirfadle wuu ka fikirayo...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 border-t px-4 py-3" style={{ borderColor: 'var(--silver-border)', backgroundColor: 'var(--bg-secondary)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--silver-border)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(245,245,245,0.08)] ${
          isOpen ? "rotate-180" : ""
        }`}
        style={{ borderColor: 'var(--silver-border)', background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))', color: 'var(--text-primary)' }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
