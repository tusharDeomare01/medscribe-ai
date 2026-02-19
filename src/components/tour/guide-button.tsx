"use client";

import { motion } from "motion/react";
import { Compass } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFloatingChat } from "@/components/providers/floating-chat-provider";
import { useTour } from "./tour-provider";

export function GuideButton() {
  const { isOpen: chatOpen } = useFloatingChat();
  const { start, isActive } = useTour();

  if (chatOpen || isActive) return null;

  return (
    <div
      className="fixed bottom-[156px] right-6 z-50"
      data-tour-id="guide-button"
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center hover:shadow-primary/40 hover:scale-105 transition-shadow"
              onClick={start}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.9,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <motion.div
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.3 }}
              >
                <Compass className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            Guided Tour
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
