"use client";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FloatingChatProvider } from "@/components/providers/floating-chat-provider";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { SiteArchitectureButton } from "@/components/layout/site-architecture-button";
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto overflow-hidden",
          "h-screen"
        )}
      >
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 rounded-tl-2xl border border-border/40 bg-background dark:bg-neutral-900 flex-1">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </div>
        </main>
        <FloatingChatButton />
        <SiteArchitectureButton />
      </div>
    </FloatingChatProvider>
  );
}
