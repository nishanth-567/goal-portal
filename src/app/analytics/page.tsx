"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Sparkles, Loader2, Download, TrendingUp, Users, Target, AlertCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Dark theme badge styles
function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    NOT_STARTED: "bg-slate-100 text-slate-400",
    ON_TRACK: "bg-blue-100 text-blue-400",
    COMPLETED: "bg-emerald-100 text-emerald-400",
    AT_RISK: "bg-amber-100 text-amber-400",
  };
  return styles[status] || styles.NOT_STARTED;
}

function getScoreBadge(score: number) {
  const styles = ["bg-red-100 text-red-400", "bg-amber-100 text-amber-400", "bg-blue-100 text-blue-400", "bg-emerald-100 text-emerald-400"];
  const index = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
  return styles[index];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  async function generateNarrative() {
    if (!data) return;
    setNarrativeLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analytics_narrative",
          analyticsData: {
            period: "Current Cycle",
            avgScore: data.totals.avgOrgScore,
            completionRate: data.checkinCompletion?.[0]?.rate || 0,
            topPerformers: data.userSummaries?.slice(0, 3).map((u: any) => u.name) || [],
            atRiskGoals: data.userSummaries?.reduce((s: number, u: any) => s + u.atRiskGoals, 0) || 0,
            totalGoals: data.totals.goals,
          },
        }),
      });
      const result = await res.json();
      setNarrative(result.narrative);
    } catch {
      setNarrative("Failed to generate narrative.");
    }
    setNarrativeLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: "48px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #FF4500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!data) return <div style={{ padding: "48px", color: "rgba(255,255,255,0.6)" }}>Failed to load analytics.</div>;

  return (
    <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Analytics</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Performance insights across your team</p>
        </div>
        <button
          onClick={() => window.open("/api/reports?format=csv", "_blank")}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "48px" }}>
        {[
          { label: "Total Employees", value: data.totals.employees, icon: Users, color: "#3b82f6" },
          { label: "Total Goals", value: data.totals.goals, icon: Target, color: "#8b5cf6" },
          { label: "Locked Goals", value: data.totals.lockedGoals, icon: Target, color: "#10b981" },
          { label: "Org Avg Score", value: `${data.totals.avgOrgScore}%`, icon: TrendingUp, color: "#f59e0b" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${kpi.color}20`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${kpi.color}30` }}>
                <Icon size={20} style={{ color: kpi.color }} />
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "white" }}>{kpi.value}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Narrative */}
      <div style={{ marginBottom: "48px", padding: "20px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} style={{ color: "#8b5cf6" }} />
            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>AI Performance Narrative</span>
          </div>
          <button
            onClick={generateNarrative}
            disabled={narrativeLoading}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#8b5cf6", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", cursor: "pointer", opacity: narrativeLoading ? 0.5 : 1 }}
          >
            {narrativeLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
            Generate Insight
          </button>
        </div>
        {narrative ? (
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{narrative}</p>
        ) : (
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Click "Generate Insight" to get an AI-powered summary of your team's performance.</p>
        )}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "32px" }}>
        {/* Quarterly Trend */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontWeight: 600, color: "white", marginBottom: "16px" }}>Quarterly Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.quarterlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
              <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v: any) => [`${v}%`, "Avg Score"]} contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Check-in Completion */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontWeight: 600, color: "white", marginBottom: "16px" }}>Check-in Completion Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.checkinCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
              <YAxis tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} unit="%" />
              <Tooltip formatter={(v: any) => [`${v}%`, "Completion"]} contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" }}>
        {/* Thrust Area Breakdown */}
        <div style={{ gridColumn: "span 2", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontWeight: 600, color: "white", marginBottom: "16px" }}>Thrust Area Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.thrustAreaBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} width={100} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Avg Score"]} contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              <Bar dataKey="avgScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontWeight: 600, color: "white", marginBottom: "16px" }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.statusDistribution.filter((d: any) => d.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }: any) => `${value}`}
              >
                {data.statusDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
              <Legend formatter={(v) => v.replace(/_/g, " ")} wrapperStyle={{ color: "rgba(255,255,255,0.6)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontWeight: 600, color: "white" }}>Employee Performance Summary</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr>
                {["Employee", "Department", "Goals", "Locked", "Avg Score", "At Risk", "Completed"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              {data.userSummaries.map((user: any) => (
                <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 500, color: "white" }}>{user.name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)" }}>{user.department || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)" }}>{user.totalGoals}</td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)" }}>{user.lockedGoals}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 500 }}>
                      {user.avgScore}%
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {user.atRiskGoals > 0 ? (
                      <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertCircle size={12} /> {user.atRiskGoals}
                      </span>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)" }}>{user.completedGoals}</td>
                </tr>
              ))}
              {data.userSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No team data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}