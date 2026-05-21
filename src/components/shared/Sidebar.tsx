"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Target, LayoutDashboard, CheckSquare, BarChart3, Users, FileText, LogOut, Sparkles, Shield, Zap } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "War Room", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "ADMIN"], accent: "#FF6B00" },
  { href: "/goals", label: "My Goals", icon: Target, roles: ["EMPLOYEE"], accent: "#FF6B00" },
  { href: "/checkins", label: "Check-ins", icon: CheckSquare, roles: ["EMPLOYEE", "MANAGER"], accent: "#00D4FF" },
  { href: "/team", label: "Team Goals", icon: Users, roles: ["MANAGER", "ADMIN"], accent: "#BF00FF" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["MANAGER", "ADMIN"], accent: "#CCFF00" },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["MANAGER", "ADMIN"], accent: "#00D4FF" },
  { href: "/admin", label: "Admin Panel", icon: Shield, roles: ["ADMIN"], accent: "#FF4500" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const visible = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside style={{ width: "240px", minHeight: "100vh", background: "rgba(8,8,12,0.95)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", backdropFilter: "blur(20px)", position: "relative", flexShrink: 0 }}>

      {/* Top glow line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FF6B00, #BF00FF, transparent)" }} />

      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #FF6B00, #FF4500)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,107,0,0.4)", flexShrink: 0 }}>
            <Target size={18} color="white" />
          </div>
          <div>
            <p className="font-display" style={{ fontSize: "18px", color: "white", lineHeight: 1 }}>
              GOAL<span style={{ color: "#FF6B00" }}>POCALYPSE</span>
            </p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>War Room</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #FF6B00, #BF00FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0, boxShadow: "0 0 15px rgba(255,107,0,0.3)" }}>
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.user?.name}</p>
            <p style={{ fontSize: "10px", color: "rgba(255,107,0,0.8)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", marginBottom: "2px", textDecoration: "none", transition: "all 0.2s", background: active ? `rgba(255,107,0,0.1)` : "transparent", borderLeft: active ? `3px solid ${item.accent}` : "3px solid transparent", color: active ? "white" : "rgba(255,255,255,0.45)" }}>
              <Icon size={16} style={{ color: active ? item.accent : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}>{item.label}</span>
              {active && <div style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", background: item.accent, boxShadow: `0 0 6px ${item.accent}` }} />}
            </Link>
          );
        })}
      </nav>

      {/* AI badge */}
      <div style={{ margin: "0 10px 10px", padding: "12px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(191,0,255,0.15), rgba(0,212,255,0.1))", border: "1px solid rgba(191,0,255,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <Sparkles size={13} style={{ color: "#BF00FF" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#BF00FF", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Powered</span>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>Goal scoring, suggestions & summaries</p>
      </div>

      {/* Sign out */}
      <div style={{ padding: "0 10px 16px" }}>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", borderRadius: "8px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,50,50,0.1)"; e.currentTarget.style.color = "#FF5050"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
