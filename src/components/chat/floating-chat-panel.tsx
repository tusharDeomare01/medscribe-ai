"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Square,
  Copy,
  Check,
  Minus,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSSE } from "@/hooks/use-sse";
import { useFloatingChat } from "@/components/providers/floating-chat-provider";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

const SUGGESTIONS = [
  "What are common side effects of Metformin?",
  "Differential diagnosis for chest pain",
  "Latest guidelines for hypertension",
  "Treatment protocol for Type 2 Diabetes",
];

export function FloatingChatPanel() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const { messages, setMessages, setIsOpen } = useFloatingChat();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    reset();

    const fullText = await startStream(
      "/api/ai/chat",
      {
        message: msg,
        history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      },
      getToken()
    );

    if (fullText) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullText,
          timestamp: new Date(),
        },
      ]);
      reset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    reset();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-24 right-6 z-50 w-[400px] h-[560px] max-w-[calc(100vw-2rem)] max-h-[70vh] md:bottom-24 flex flex-col bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground">
              {isStreaming ? "Typing..." : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-sm font-semibold mb-1">How can I help?</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Ask clinical questions, drug interactions, or treatment protocols.
            </p>
            <div className="space-y-2 w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === "user" ? (
                  <div className="flex gap-2 justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-xs leading-relaxed">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-[9px] text-muted-foreground/50 mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                    <Avatar className="w-6 h-6 shrink-0 mt-1">
                      <AvatarFallback className="bg-secondary text-[10px]">
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Avatar className="w-6 h-6 shrink-0 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        <Bot className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[85%] group">
                      <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-3 py-2 text-xs">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[9px] text-muted-foreground/50">
                          {formatTime(msg.timestamp)}
                        </p>
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming */}
            {isStreaming && streamedText && (
              <div className="flex gap-2">
                <Avatar className="w-6 h-6 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-3 py-2 text-xs">
                    <MarkdownRenderer content={streamedText} />
                    <span className="inline-block w-1 h-3 bg-primary rounded-sm ml-0.5 animate-blink align-middle" />
                  </div>
                </div>
              </div>
            )}

            {/* Thinking */}
            {isStreaming && !streamedText && (
              <div className="flex gap-2 items-start">
                <Avatar className="w-6 h-6 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                <AlertCircle className="w-3 h-3 shrink-0" /> {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-1.5 p-2 rounded-md border border-border/30 bg-muted/20 text-[9px] text-muted-foreground">
          <AlertCircle className="w-3 h-3 shrink-0" />
          AI content is for informational purposes only.
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2 items-end">
          <textarea
            placeholder="Ask a medical question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none min-h-[36px] max-h-[80px] rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {isStreaming ? (
            <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={stopStream}>
              <Square className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
