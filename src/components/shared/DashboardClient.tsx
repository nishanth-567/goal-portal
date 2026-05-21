"use client";
import { Target, CheckSquare, AlertCircle, Clock, TrendingUp, Users, Sparkles, ChevronRight, Zap, Flame } from "lucide-react";
import Link from "next/link";

interface Props { session: any; stats: any; teamStats: any; cycle: any; recentGoals: any[]; }

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "badge badge-draft" },
  SUBMITTED: { label: "Submitted", cls: "badge badge-submitted" },
  APPROVED: { label: "Approved", cls: "badge badge-approved" },
  RETURNED: { label: "Returned", cls: "badge badge-returned" },
  LOCKED: { label: "Locked", cls: "badge badge-locked" },
};

function KpiCard({ label, value, icon: Icon, color, sub, delay = "0" }: any) {
  return (
    <div className={`glass-card slide-up-${delay}`} style={{ borderRadius: "12px", padding: "20px", position: "relative", overflow: "hidden", transition: "transform 0.2s", cursor: "default" }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p style={{ fontSize: "26px", fontWeight: 700, color: "white", lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "3px" }}>{label}</p>
          {sub && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({ session, stats, teamStats, cycle, recentGoals }: Props) {
  const name = session.user.name?.split(" ")[0] || "Warrior";
  const role = session.user.role;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "RISE AND GRIND" : hour < 17 ? "STAY LOCKED IN" : "FINISH STRONG";

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div className="slide-up" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Flame size={20} style={{ color: "#FF6B00" }} />
          <p style={{ fontSize: "12px", color: "#FF6B00", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>{greeting}, {name}</p>
        </div>
        <h1 className="font-display" style={{ fontSize: "42px", color: "white", lineHeight: 1, marginBottom: "8px" }}>
          YOUR <span style={{ color: "#FF6B00" }} className="text-glow-fire">WAR ROOM</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
          {cycle ? `Active cycle: ${cycle.name}` : "No active cycle — contact admin"}
        </p>
      </div>

      {/* My Goal Stats */}
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>My Arsenal</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <KpiCard label="Total Goals" value={stats.totalGoals} icon={Target} color="#FF6B00" sub={`${stats.totalWeightage}% weighted`} delay="1" />
          <KpiCard label="Locked & Loaded" value={stats.lockedGoals} icon={CheckSquare} color="#00D4FF" delay="2" />
          <KpiCard label="Awaiting Review" value={stats.submittedGoals} icon={Clock} color="#FF8C00" delay="3" />
          <KpiCard label="Needs Rework" value={stats.returnedGoals} icon={AlertCircle} color="#FF4500" delay="4" />
        </div>
      </div>

      {/* Team Stats */}
      {teamStats && (
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>Team Intel</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <KpiCard label="Soldiers" value={teamStats.teamSize} icon={Users} color="#BF00FF" />
            <KpiCard label="Goals Locked" value={teamStats.lockedGoals} icon={CheckSquare} color="#00D4FF" sub={`of ${teamStats.totalGoals}`} />
            <KpiCard label="Pending Approval" value={teamStats.pendingApproval} icon={Clock} color="#FF8C00" />
            <KpiCard label="At Risk" value={teamStats.atRisk} icon={AlertCircle} color="#FF4500" />
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>

        {/* Recent goals */}
        <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 700, color: "white", fontSize: "14px" }}>Recent Goals</p>
            <Link href="/goals" style={{ fontSize: "12px", color: "#FF6B00", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {recentGoals.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Target size={40} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>No goals yet. Start your apocalypse.</p>
              <Link href="/goals/new" style={{ display: "inline-block", marginTop: "12px", padding: "8px 16px", background: "linear-gradient(135deg, #FF6B00, #FF4500)", borderRadius: "8px", color: "white", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                Create First Goal →
              </Link>
            </div>
          ) : (
            recentGoals.map((goal) => {
              const cfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG.DRAFT;
              const lastCheckin = goal.checkins?.[goal.checkins.length - 1];
              return (
                <Link key={goal.id} href={`/goals/${goal.id}`} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,0,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.title}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{goal.thrustArea?.name} · {goal.weightage}%</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {lastCheckin?.progressScore != null && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: lastCheckin.progressScore >= 80 ? "#CCFF00" : lastCheckin.progressScore >= 60 ? "#00D4FF" : "#FF4500" }}>
                        {lastCheckin.progressScore.toFixed(0)}%
                      </span>
                    )}
                    <span className={cfg.cls}>{cfg.label}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* AI card */}
          <div style={{ borderRadius: "12px", padding: "20px", background: "linear-gradient(135deg, rgba(191,0,255,0.2), rgba(0,212,255,0.1))", border: "1px solid rgba(191,0,255,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "radial-gradient(circle, rgba(191,0,255,0.3), transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={16} style={{ color: "#BF00FF" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#BF00FF", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Co-Pilot</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "14px", lineHeight: 1.5 }}>AI scores your goals, suggests improvements & summarizes check-ins.</p>
            <Link href="/goals/new" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "rgba(191,0,255,0.3)", border: "1px solid rgba(191,0,255,0.4)", borderRadius: "8px", color: "white", textDecoration: "none", fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }}>
              <Zap size={13} /> Create with AI
            </Link>
          </div>

          {/* Quick actions */}
          <div className="glass-card" style={{ borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Quick Strikes</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                { href: "/goals/new", label: "New Goal", icon: Target, color: "#FF6B00" },
                { href: "/checkins", label: "Log Achievement", icon: CheckSquare, color: "#00D4FF" },
                ...(role !== "EMPLOYEE" ? [{ href: "/team", label: "Review Team", icon: Users, color: "#BF00FF" }] : []),
                ...(role !== "EMPLOYEE" ? [{ href: "/analytics", label: "View Analytics", icon: TrendingUp, color: "#CCFF00" }] : []),
              ].map((item) => (
                <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 500, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                  <item.icon size={14} style={{ color: item.color }} /> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
