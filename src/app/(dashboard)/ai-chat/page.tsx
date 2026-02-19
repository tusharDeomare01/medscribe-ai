"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  AlertCircle,
  Square,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSSE } from "@/hooks/use-sse";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What are the common side effects of Metformin?",
  "Explain the differential diagnosis for chest pain",
  "What are the latest guidelines for hypertension management?",
  "Summarize the treatment protocol for Type 2 Diabetes",
];

export default function AIChatPage() {
  const { getToken } = useAuth();
  const { streamedText, isStreaming, error, startStream, stopStream, reset } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".chat-header", { y: -20, opacity: 0, duration: 0.5, ease: "power3.out" });
      gsap.from(".suggestion-chip", {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.3,
        ease: "back.out(1.5)",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Auto scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, streamedText]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
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

  const clearChat = () => {
    setMessages([]);
    reset();
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={containerRef} className="h-[calc(100vh-160px)] flex flex-col">
      {/* Floating Chat Banner */}
      <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          AI Assistant is now available as a <strong className="text-foreground">floating button</strong> on every page! Look for the chat icon in the bottom-right corner.
        </p>
      </div>

      {/* Header */}
      <div className="chat-header flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" /> AI Clinical Assistant
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ask medical questions, discuss cases, or get clinical insights.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={clearChat}>
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <Card data-tour-id="chat-messages" className="flex-1 flex flex-col border-border/50 overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                I can help with clinical questions, drug interactions, treatment protocols,
                differential diagnoses, and more.
              </p>

              <div data-tour-id="chat-suggestions" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="suggestion-chip text-left p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 text-sm"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" ? (
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[75%]">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      <Avatar className="w-8 h-8 shrink-0 mt-1">
                        <AvatarFallback className="bg-secondary text-xs">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-1">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[85%] group">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-[10px] text-muted-foreground/50">
                            {formatTime(msg.timestamp)}
                          </p>
                          <button
                            onClick={() => copyMessage(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-muted-foreground"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming response */}
              {isStreaming && streamedText && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4 text-sm">
                      <MarkdownRenderer content={streamedText} />
                      <span className="inline-block w-1.5 h-4 bg-primary rounded-sm ml-0.5 animate-blink align-middle" />
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {isStreaming && !streamedText && (
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/30 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/30 bg-muted/20 text-xs text-muted-foreground mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            AI-generated content is for informational purposes only. Not a substitute for professional medical advice.
          </div>

          <div className="flex gap-3 items-end">
            <Textarea
              placeholder="Ask a medical question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="resize-none min-h-[44px] max-h-[120px]"
            />
            {isStreaming ? (
              <Button variant="destructive" size="icon" className="h-11 w-11 shrink-0" onClick={stopStream}>
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
