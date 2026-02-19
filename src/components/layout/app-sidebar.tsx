"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/aceternity-sidebar";
import {
  IconLayoutDashboard,
  IconUsers,
  IconFileText,
  IconUpload,
  IconMessageChatbot,
  IconChartBar,
  IconStethoscope,
  IconLogout,
  IconSun,
  IconMoon,
  IconHeartbeat,
  IconClipboardHeart,
  IconSchool,
  IconVideo,
  IconCalendarBolt,
  IconPhoneCall,
  IconShieldCheck,
  IconFileBarcode,
  IconReceipt,
  IconNurse,
  IconDeviceHeartMonitor,
  IconCalendarStats,
  IconCertificate,
} from "@tabler/icons-react";
import { motion } from "motion/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/patients", label: "Patients", icon: IconUsers },
  { href: "/notes", label: "Clinical Notes", icon: IconFileText },
  { href: "/reports", label: "Report Analysis", icon: IconUpload },
  { href: "/ai-chat", label: "AI Assistant", icon: IconMessageChatbot },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
];

const patientCareItems = [
  { href: "/health-assistant", label: "Health Assistant", icon: IconHeartbeat },
  { href: "/care-plans", label: "Care Plans", icon: IconClipboardHeart },
  { href: "/education", label: "Education", icon: IconSchool },
  { href: "/visits", label: "Visits", icon: IconVideo },
];

const frontOfficeItems = [
  { href: "/scheduling", label: "Smart Scheduling", icon: IconCalendarBolt },
  { href: "/call-routing", label: "Call Routing", icon: IconPhoneCall },
  { href: "/insurance", label: "Insurance Check", icon: IconShieldCheck },
];

const billingItems = [
  { href: "/medical-coding", label: "Medical Coding", icon: IconFileBarcode },
  { href: "/billing", label: "Billing & Revenue", icon: IconReceipt },
];

const nursingItems = [
  { href: "/nursing-assistant", label: "Nursing AI", icon: IconNurse },
  { href: "/patient-monitoring", label: "Monitoring", icon: IconDeviceHeartMonitor },
  { href: "/shift-scheduling", label: "Shift Scheduling", icon: IconCalendarStats },
  { href: "/staff-training", label: "Staff Training", icon: IconCertificate },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MS";

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const mapLinks = (items: typeof navItems) =>
    items.map((item) => ({
      label: item.label,
      href: item.href,
      icon: (
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0",
            isActive(item.href)
              ? "text-primary"
              : "text-neutral-700 dark:text-neutral-200"
          )}
        />
      ),
    }));

  const links = mapLinks(navItems);
  const patientCareLinks = mapLinks(patientCareItems);
  const frontOfficeLinks = mapLinks(frontOfficeItems);
  const billingLinks = mapLinks(billingItems);
  const nursingLinks = mapLinks(nursingItems);

  const renderGroup = (label: string, groupLinks: ReturnType<typeof mapLinks>) => (
    <div className="mt-4 flex flex-col gap-1">
      <motion.div
        animate={{
          display: open ? "block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="px-3 mb-1"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
      </motion.div>
      {!open && <div className="h-px bg-border/50 mx-2 mb-1" />}
      {groupLinks.map((link) => (
        <SidebarLink
          key={link.href}
          link={link}
          active={isActive(link.href)}
        />
      ))}
    </div>
  );

  return (
    <div data-tour-id="sidebar">
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 border-r border-border/50 bg-background dark:bg-neutral-900">
        {/* Top section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className={cn("flex items-center gap-2 py-1 transition-all duration-300", open ? "px-2" : "px-0 justify-center")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <IconStethoscope className="w-5 h-5 text-primary-foreground" stroke={1.5} />
            </div>
            <motion.div
              animate={{
                display: open ? "flex" : "none",
                opacity: open ? 1 : 0,
              }}
              className="flex flex-col whitespace-pre"
            >
              <span className="text-sm font-bold tracking-tight text-foreground leading-tight">
                MedScribe AI
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Clinical Platform
              </span>
            </motion.div>
          </div>

          {/* Nav links */}
          <div className="mt-8 flex flex-col gap-1">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                link={link}
                active={isActive(link.href)}
              />
            ))}
          </div>

          {renderGroup("Patient Care", patientCareLinks)}
          {renderGroup("Front Office", frontOfficeLinks)}
          {renderGroup("Coding & Billing", billingLinks)}
          {renderGroup("Nursing & Ops", nursingLinks)}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1">
          {/* Theme toggle */}
          <SidebarLink
            link={{
              label: theme === "dark" ? "Light Mode" : "Dark Mode",
              href: "#",
              icon:
                theme === "dark" ? (
                  <IconSun className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ) : (
                  <IconMoon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          {/* Logout */}
          <SidebarLink
            link={{
              label: "Logout",
              href: "#",
              icon: (
                <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
              ),
            }}
            onClick={logout}
          />

          {/* Divider */}
          <div className="h-px bg-border/50 mx-1 my-1" />

          {/* User info → Profile */}
          <SidebarLink
            link={{
              label: user?.name || "User",
              href: "/profile",
              icon: (
                <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">
                    {initials}
                  </span>
                </div>
              ),
            }}
            active={isActive("/profile")}
          />
        </div>
      </SidebarBody>
    </Sidebar>
    </div>
  );
}
