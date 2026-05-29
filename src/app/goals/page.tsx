"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Target, Send, Sparkles, AlertCircle } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => { setGoals(data); setLoading(false); });
  }, []);

  const totalWeightage = goals.reduce((s, g) => s + g.weightage, 0);
  const weightageOk = Math.abs(totalWeightage - 100) < 0.01;

  async function submitGoal(goalId: string) {
    if (!weightageOk) {
      setMessage(`Total weightage is ${totalWeightage}%. Must equal 100% to submit.`);
      return;
    }
    setSubmitting(goalId);
    const res = await fetch(`/api/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });
    const data = await res.json();
    if (res.ok) {
      setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, status: "SUBMITTED" } : g));
    } else {
      setMessage(data.error);
    }
    setSubmitting(null);
  }

  const filtered = filter === "ALL" ? goals : goals.filter((g) => g.status === filter);

  if (loading) {
    return (
      <div style={{ padding: "48px", display: "flex", alignItems: "center", justifyContent: "center", height: "300px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid #FF4500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  // Status badge styles for dark theme
  const statusStyles: Record<string, { bg: string; color: string }> = {
    DRAFT: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },
    SUBMITTED: { bg: "rgba(255,165,0,0.15)", color: "#FFA500" },
    APPROVED: { bg: "rgba(52,199,89,0.15)", color: "#34C759" },
    RETURNED: { bg: "rgba(255,69,0,0.15)", color: "#FF4500" },
    LOCKED: { bg: "rgba(52,199,89,0.15)", color: "#34C759" },
  };

  const scoreBg = (score: number) => {
    if (score >= 90) return "rgba(52,199,89,0.15)";
    if (score >= 70) return "rgba(0,122,255,0.15)";
    if (score >= 50) return "rgba(255,165,0,0.15)";
    return "rgba(255,69,0,0.15)";
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return "#34C759";
    if (score >= 70) return "#007AFF";
    if (score >= 50) return "#FFA500";
    return "#FF4500";
  };

  return (
    <div style={{ padding: "48px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>My Goals</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
            {goals.length} goals · {totalWeightage}% total weightage
            {!weightageOk && goals.length > 0 && (
              <span style={{ marginLeft: "8px", color: "#FFA500", fontSize: "12px" }}>⚠ Must total 100% to submit</span>
            )}
          </p>
        </div>
        <Link
          href="/goals/new"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "#FF4500", color: "white", borderRadius: "10px", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}
        >
          <Plus size={16} /> New Goal
        </Link>
      </div>

      {message && (
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: "10px", fontSize: "13px", color: "#FF4500" }}>
          <AlertCircle size={16} /> {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Weightage progress bar */}
      {goals.length > 0 && (
        <div style={{ marginBottom: "32px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Total Weightage</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: weightageOk ? "#34C759" : "#FFA500" }}>
              {totalWeightage}% / 100%
            </span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div
              style={{ height: "100%", background: totalWeightage > 100 ? "#FF4500" : weightageOk ? "#34C759" : "#FFA500", width: `${Math.min(totalWeightage, 100)}%`, borderRadius: "3px" }}
            />
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>Min 10% per goal · Max 8 goals · Must total 100% to submit</p>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["ALL", "DRAFT", "SUBMITTED", "LOCKED", "RETURNED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
              background: filter === s ? "#FF4500" : "rgba(255,255,255,0.03)",
              color: filter === s ? "white" : "rgba(255,255,255,0.6)",
              border: filter === s ? "none" : "1px solid rgba(255,255,255,0.1)" }}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            {s !== "ALL" && (
              <span style={{ marginLeft: "4px", opacity: 0.6 }}>({goals.filter((g) => g.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Target size={48} style={{ margin: "0 auto 12px", color: "rgba(255,255,255,0.2)" }} />
          <h3 style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: "6px" }}>No goals found</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "20px" }}>Create your first goal to get started.</p>
          <Link href="/goals/new" style={{ display: "inline-block", padding: "10px 20px", background: "#FF4500", color: "white", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            Create Goal
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((goal) => {
            const lastCheckin = goal.checkins?.[goal.checkins.length - 1];
            const status = statusStyles[goal.status] || statusStyles.DRAFT;
            return (
              <div key={goal.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                      <Link href={`/goals/${goal.id}`} style={{ fontWeight: 600, color: "white", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {goal.title}
                      </Link>
                      <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: status.bg, color: status.color, fontWeight: 500 }}>
                        {goal.status === "LOCKED" ? "✓ Approved" : goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
                      </span>
                      {goal.aiQualityScore && (
                        <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: "rgba(139,92,246,0.15)", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                          <Sparkles size={10} /> {goal.aiQualityScore}/100
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      <span>{goal.thrustArea?.name}</span>
                      <span>·</span>
                      <span>{goal.uomType}</span>
                      {goal.target && <><span>·</span><span>Target: {goal.target} {goal.uomUnit}</span></>}
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{goal.weightage}%</span>
                    </div>
                    {goal.managerComment && (
                      <p style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px" }}>
                        💬 Manager: {goal.managerComment}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    {lastCheckin?.progressScore != null && (
                      <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "6px", fontWeight: 600, background: scoreBg(lastCheckin.progressScore), color: scoreColor(lastCheckin.progressScore) }}>
                        {lastCheckin.progressScore.toFixed(0)}% score
                      </span>
                    )}
                    {(goal.status === "DRAFT" || goal.status === "RETURNED") && (
                      <button
                        onClick={() => submitGoal(goal.id)}
                        disabled={submitting === goal.id}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#FF4500", color: "white", borderRadius: "8px", fontSize: "12px", cursor: "pointer", opacity: submitting === goal.id ? 0.5 : 1 }}
                      >
                        <Send size={12} /> Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}