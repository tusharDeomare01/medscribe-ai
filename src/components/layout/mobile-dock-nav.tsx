"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  BarChart3,
} from "lucide-react";
import Dock from "@/components/Dock";
import type { DockItemData } from "@/components/Dock";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/reports", label: "Reports", icon: Upload },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function MobileDockNav() {
  const pathname = usePathname();
  const router = useRouter();

  const dockItems: DockItemData[] = navItems.map((item) => ({
    icon: (
      <item.icon
        className={`w-5 h-5 ${
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      />
    ),
    label: item.label,
    onClick: () => router.push(item.href),
  }));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <Dock
        items={dockItems}
        panelHeight={56}
        baseItemSize={44}
        magnification={60}
        distance={120}
        className="bg-background/80 backdrop-blur-xl border-border/50"
      />
    </div>
  );
}
