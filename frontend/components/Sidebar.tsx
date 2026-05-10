"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Sparkles,
  Bell,
  MessageSquare,
  Settings2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/forecasts", label: "Forecasts", icon: TrendingUp },
    ],
  },
  {
    label: "AI TOOLS",
    items: [
      { href: "/dashboard/insights", label: "Insights", icon: Sparkles },
      { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
      { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0d0d14] z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06] shrink-0 h-16">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 p-2">
          <Package className="h-full w-full text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white">ShelfMind AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="px-4 mt-5 mb-1 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative mx-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors cursor-pointer",
                      active
                        ? "bg-violet-600/15 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                        : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                    )}
                  >
                    {active && (
                      <div className="absolute left-[-12px] h-5 w-[3px] bg-violet-500 rounded-r-full" />
                    )}
                    <Icon className={cn("flex-shrink-0", active ? "text-violet-400" : "text-gray-500")} size={18} />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] px-4 py-4 shrink-0 bg-[#0d0d14]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-violet-300 text-xs font-semibold">
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-medium text-white">{user?.full_name}</p>
            <p className="truncate text-[11px] text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
