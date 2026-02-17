"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import gsap from "gsap";
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  BarChart3,
  Stethoscope,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Brain,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* Nav link definitions */
const directLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const clinicalLinks = [
  {
    href: "/patients",
    label: "Patients",
    desc: "Manage patient records",
    icon: Users,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    href: "/notes",
    label: "Clinical Notes",
    desc: "AI NER & SOAP generation",
    icon: FileText,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const intelligenceLinks = [
  {
    href: "/reports",
    label: "Report Analysis",
    desc: "AI lab report interpretation",
    icon: Upload,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export function FloatingNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MS";

  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const isClinicalActive = clinicalLinks.some((l) => isActive(l.href));
  const isIntelligenceActive = intelligenceLinks.some((l) => isActive(l.href));

  /* Dropdown hover with debounced close */
  const handleMenuEnter = (key: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenMenu(key);
  };
  const handleMenuLeave = () => {
    closeTimeout.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const handleLogout = () => {
    setOpenMenu(null);
    logout();
  };

  return (
    <div
      ref={navRef}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <nav className="flex items-center gap-1 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] px-2 py-1.5">
        {/* ── Logo ── */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted/50 transition-colors duration-200"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20">
            <Stethoscope className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight hidden lg:block">
            MedScribe
          </span>
        </Link>

        {/* ── Separator ── */}
        <div className="w-px h-5 bg-border/60 mx-0.5" />

        {/* ── Direct links ── */}
        {directLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200",
              isActive(link.href)
                ? "text-primary bg-primary/10 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <link.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}

        {/* ── Clinical dropdown ── */}
        <div
          className="relative"
          onMouseEnter={() => handleMenuEnter("clinical")}
          onMouseLeave={handleMenuLeave}
        >
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200",
              isClinicalActive
                ? "text-primary bg-primary/10 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clinical</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                openMenu === "clinical" && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {openMenu === "clinical" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2"
              >
                <div className="bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-black/30 p-1.5 min-w-[240px]">
                  {clinicalLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                        isActive(item.href)
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          item.bg
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", item.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Intelligence dropdown ── */}
        <div
          className="relative"
          onMouseEnter={() => handleMenuEnter("intelligence")}
          onMouseLeave={handleMenuLeave}
        >
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200",
              isIntelligenceActive
                ? "text-primary bg-primary/10 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intelligence</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                openMenu === "intelligence" && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {openMenu === "intelligence" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2"
              >
                <div className="bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-black/30 p-1.5 min-w-[240px]">
                  {intelligenceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMenu(null)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                        isActive(item.href)
                          ? "bg-primary/8 text-primary"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          item.bg
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", item.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Separator ── */}
        <div className="w-px h-5 bg-border/60 mx-0.5" />

        {/* ── Theme toggle ── */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>

        {/* ── User menu ── */}
        <div
          className="relative"
          onMouseEnter={() => handleMenuEnter("user")}
          onMouseLeave={handleMenuLeave}
        >
          <button
            className="p-1 rounded-xl hover:bg-muted/50 transition-all duration-200"
            aria-label="User menu"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          <AnimatePresence>
            {openMenu === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-[calc(100%+8px)] right-0"
              >
                <div className="bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-black/30 p-1.5 min-w-[200px]">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>

                  <div className="my-1.5 h-px bg-border/40 mx-2" />

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-150 w-full text-left text-[13px] text-muted-foreground"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );
}
