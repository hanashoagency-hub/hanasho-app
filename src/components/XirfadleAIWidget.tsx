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
        className={`mb-4 flex w-[340px] flex-col overflow-hidden rounded-[20px] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl transition-all duration-300 sm:w-[380px] ${
          isOpen
            ? "h-[500px] opacity-100 pointer-events-auto translate-y-0"
            : "h-0 opacity-0 pointer-events-none translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-5 py-4">
          <div className="h-9 w-9 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-[var(--bg-primary)]" />
          </div>
          <div className="flex-1">
            <h4 className="font-heading text-sm font-bold text-[var(--text-primary)]">
              Xirfadle AI
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">Your AI Mentor — Ask anything about your studies</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 bg-[var(--bg-secondary)]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-[16px] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "bot"
                  ? "self-start rounded-tl-none border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  : "self-end rounded-tr-none bg-[var(--brand-primary)] text-[var(--bg-primary)]"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="self-start rounded-[16px] rounded-tl-none border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <span className="animate-pulse">Xirfadle wuu ka fikirayo...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 rounded-[12px] border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--brand-primary)]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--brand-primary)] text-[var(--bg-primary)] transition-transform hover:scale-105 disabled:opacity-50 hover:bg-[var(--brand-hover)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--brand-hover)] ${
          isOpen ? "rotate-180" : ""
        }`}
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
