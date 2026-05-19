"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Target, LayoutDashboard, CheckSquare, BarChart3,
  Users, FileText, Settings, LogOut, Sparkles, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
  { href: "/goals", label: "My Goals", icon: Target, roles: ["EMPLOYEE"] },
  { href: "/checkins", label: "Check-ins", icon: CheckSquare, roles: ["EMPLOYEE", "MANAGER"] },
  { href: "/team", label: "Team Goals", icon: Users, roles: ["MANAGER", "ADMIN"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["MANAGER", "ADMIN"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin", label: "Admin Panel", icon: Shield, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visible = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
          <Target size={20} />
        </div>
        <div>
          <p className="font-semibold text-sm">GoalTrack</p>
          <p className="text-xs text-slate-400">Performance Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* AI badge */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20">
        <div className="flex items-center gap-2 text-xs text-violet-300">
          <Sparkles size={14} />
          <span className="font-medium">AI-Powered Features Active</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Goal scoring, suggestions & summaries</p>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
