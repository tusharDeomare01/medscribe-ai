"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { IconSitemap } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFloatingChat } from "@/components/providers/floating-chat-provider";

export function SiteArchitectureButton() {
  const router = useRouter();
  const { isOpen: chatOpen } = useFloatingChat();

  if (chatOpen) return null;

  return (
    <div className="fixed bottom-[88px] right-6 z-50">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center hover:shadow-primary/40 hover:scale-105 transition-shadow"
              onClick={() => router.push("/sitemap")}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.7,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <motion.div
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              >
                <IconSitemap className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Site Architecture
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
