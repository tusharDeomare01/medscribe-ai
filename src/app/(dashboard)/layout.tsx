"use client";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingNavbar } from "@/components/layout/floating-navbar";
import { MobileDockNav } from "@/components/layout/mobile-dock-nav";
import { FloatingChatProvider } from "@/components/providers/floating-chat-provider";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <FloatingChatProvider>
      <div className="min-h-screen">
        <FloatingNavbar />
        <main className="pt-24 pb-20 md:pb-6 transition-all duration-300">
          <div className="px-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
        <MobileDockNav />
        <FloatingChatButton />
      </div>
    </FloatingChatProvider>
  );
}
