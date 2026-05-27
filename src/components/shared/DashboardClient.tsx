"use client";
import { Target, CheckSquare, AlertCircle, Clock, TrendingUp, Users, Sparkles, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

interface Props { session: any; stats: any; teamStats: any; cycle: any; recentGoals: any[]; }

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "badge badge-draft" },
  SUBMITTED: { label: "In Review", cls: "badge badge-submitted" },
  APPROVED: { label: "Approved", cls: "badge badge-approved" },
  RETURNED: { label: "Returned", cls: "badge badge-returned" },
  LOCKED: { label: "Active", cls: "badge badge-locked" },
};

function StatCard({ label, value, icon: Icon, accent, sub, delay }: any) {
  return (
    <div className={`glass card-hover fade-up-${delay}`} style={{ borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${accent}20` }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={2} />
        </div>
      </div>
      <p style={{ fontSize: "32px", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "6px", fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "3px" }}>{sub}</p>}
    </div>
  );
}

export function DashboardClient({ session, stats, teamStats, cycle, recentGoals }: Props) {
  const name = session.user.name?.split(" ")[0] || "there";
  const role = session.user.role;

  return (
    <div style={{ padding: "48px 48px 48px", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "48px" }}>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 500, marginBottom: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {cycle ? cycle.name : "No Active Cycle"} · {cycle?.phase?.replace(/_/g, " ")}
        </p>
        <h1 style={{ fontSize: "48px", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "12px" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},<br />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{name}.</span>
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
          {stats.lockedGoals > 0 ? `${stats.lockedGoals} goals active. ${stats.submittedGoals > 0 ? `${stats.submittedGoals} awaiting review.` : "Keep pushing."}` : "No goals locked yet. Start building your plan."}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "48px" }}>
        <StatCard label="Total Goals" value={stats.totalGoals} icon={Target} accent="#FF4500" sub={`${stats.totalWeightage}% weighted`} delay="1" />
        <StatCard label="Active Goals" value={stats.lockedGoals} icon={Activity} accent="#34C759" delay="2" />
        <StatCard label="In Review" value={stats.submittedGoals} icon={Clock} accent="#FFA500" delay="3" />
        <StatCard label="Need Attention" value={stats.returnedGoals} icon={AlertCircle} accent="#FF4500" delay="4" />
      </div>

      {/* Team stats */}
      {teamStats && (
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Team Performance</p>
            <Link href="/analytics" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
              View analytics <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <StatCard label="Team Members" value={teamStats.teamSize} icon={Users} accent="#007AFF" delay="1" />
            <StatCard label="Goals Active" value={teamStats.lockedGoals} icon={CheckSquare} accent="#34C759" sub={`of ${teamStats.totalGoals}`} delay="2" />
            <StatCard label="Pending Approval" value={teamStats.pendingApproval} icon={Clock} accent="#FFA500" delay="3" />
            <StatCard label="At Risk" value={teamStats.atRisk} icon={AlertCircle} accent="#FF4500" delay="4" />
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>

        {/* Goals list */}
        <div className="glass" style={{ borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>Recent Goals</p>
            <Link href="/goals" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentGoals.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Target size={22} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <p style={{ fontSize: "15px", fontWeight: 500, color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>No goals yet</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginBottom: "20px" }}>Start building your performance plan.</p>
              <Link href="/goals/new" className="btn-primary" style={{ textDecoration: "none", fontSize: "13px", padding: "10px 20px" }}>
                Create first goal
              </Link>
            </div>
          ) : (
            recentGoals.map((goal, i) => {
              const cfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG.DRAFT;
              const lastCheckin = goal.checkins?.[goal.checkins.length - 1];
              return (
                <Link key={goal.id} href={`/goals/${goal.id}`} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", textDecoration: "none", borderBottom: i < recentGoals.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: goal.status === "LOCKED" ? "#34C759" : goal.status === "SUBMITTED" ? "#FFA500" : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{goal.title}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{goal.thrustArea?.name} · {goal.weightage}% weight</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    {lastCheckin?.progressScore != null && (
                      <span style={{ fontSize: "13px", fontWeight: 700, color: lastCheckin.progressScore >= 80 ? "#34C759" : lastCheckin.progressScore >= 60 ? "#007AFF" : "#FF4500" }}>
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
          <div className="glass" style={{ borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Sparkles size={14} style={{ color: "#FF4500" }} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI Assistant</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "16px" }}>Score goal quality, get suggestions, and summarize check-ins automatically.</p>
            <Link href="/goals/new" className="btn-secondary" style={{ textDecoration: "none", fontSize: "13px", padding: "9px 18px", width: "100%", justifyContent: "center" }}>
              Create with AI
            </Link>
          </div>

          {/* Quick actions */}
          <div className="glass" style={{ borderRadius: "16px", padding: "8px" }}>
            {[
              { href: "/goals/new", label: "New Goal", icon: Target },
              { href: "/checkins", label: "Log Achievement", icon: CheckSquare },
              ...(role !== "EMPLOYEE" ? [{ href: "/team", label: "Review Team", icon: Users }] : []),
              ...(role !== "EMPLOYEE" ? [{ href: "/analytics", label: "Analytics", icon: TrendingUp }] : []),
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", borderRadius: "10px", textDecoration: "none", color: "rgba(255,255,255,0.45)", fontSize: "14px", fontWeight: 500, transition: "all 0.15s", letterSpacing: "-0.01em" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
                <item.icon size={14} style={{ flexShrink: 0 }} /> {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
