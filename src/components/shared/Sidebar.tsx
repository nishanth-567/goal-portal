"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Target, LayoutDashboard, CheckSquare, BarChart3, Users, FileText, LogOut, Sparkles, Shield } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "ADMIN"] },
  { href: "/goals", label: "Goals", icon: Target, roles: ["EMPLOYEE"] },
  { href: "/checkins", label: "Check-ins", icon: CheckSquare, roles: ["EMPLOYEE", "MANAGER"] },
  { href: "/team", label: "Team", icon: Users, roles: ["MANAGER", "ADMIN"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["MANAGER", "ADMIN"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["MANAGER", "ADMIN"] },
  { href: "/admin", label: "Admin", icon: Shield, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const visible = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside style={{ width: "220px", minHeight: "100vh", background: "#000000", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>

      {/* Logo */}
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#FF4500", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Target size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Goalpocalypse</span>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{session?.user?.name}</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "1px", textTransform: "capitalize" }}>{role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>Navigation</p>
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", marginBottom: "1px", textDecoration: "none", transition: "all 0.15s", background: active ? "rgba(255,255,255,0.07)" : "transparent", color: active ? "white" : "rgba(255,255,255,0.4)" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}}>
              <Icon size={15} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0, color: active ? "#FF4500" : "inherit" }} />
              <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI */}
      <div style={{ margin: "0 12px 12px", padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
          <Sparkles size={12} style={{ color: "#FF4500" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase" }}>AI Active</span>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>Goal scoring & smart suggestions</p>
      </div>

      {/* Sign out */}
      <div style={{ padding: "0 12px 20px" }}>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "12px" }} />
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", borderRadius: "8px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontFamily: "inherit", fontSize: "13px", transition: "all 0.15s", textAlign: "left" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#FF4500"; e.currentTarget.style.background = "rgba(255,69,0,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "none"; }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
