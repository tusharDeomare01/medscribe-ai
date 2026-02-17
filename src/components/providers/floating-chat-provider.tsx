"use client";

import React, { createContext, useContext, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const FloatingChatContext = createContext<FloatingChatContextType | null>(null);

export function FloatingChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <FloatingChatContext.Provider value={{ isOpen, setIsOpen, messages, setMessages }}>
      {children}
    </FloatingChatContext.Provider>
  );
}

export function useFloatingChat() {
  const context = useContext(FloatingChatContext);
  if (!context) {
    throw new Error("useFloatingChat must be used within FloatingChatProvider");
  }
  return context;
}
