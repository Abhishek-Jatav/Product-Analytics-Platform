"use client";

import { BellRing, FlaskConical, Filter, LayoutDashboard, Radio, Repeat, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { ROUTES } from "@/constants/app.constants";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Overview", icon: LayoutDashboard },
  { href: ROUTES.EVENTS, label: "Events", icon: Radio },
  { href: ROUTES.FUNNELS, label: "Funnels", icon: Filter },
  { href: ROUTES.RETENTION, label: "Retention", icon: Repeat },
  { href: ROUTES.EXPERIMENTS, label: "Experiments", icon: FlaskConical },
  { href: ROUTES.SEGMENTS, label: "Segments", icon: Users },
  { href: ROUTES.ALERTS, label: "Alerts", icon: BellRing },
  { href: ROUTES.TEAM, label: "Team", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] p-4">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-small font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
