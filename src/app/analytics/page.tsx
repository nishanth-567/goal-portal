"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Sparkles, Loader2, Download, TrendingUp, Users, Target, AlertCircle, Activity } from "lucide-react";

const COLORS = ["#FF4500", "#34C759", "#FFA500", "#007AFF", "#BF00FF"];

function StatCard({ label, value, icon: Icon, accent }: any) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: accent }} />
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${accent}14`, border: `1px solid ${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <p style={{ fontSize: "32px", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.details || d.error);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
            avgScore: data.totals?.avgOrgScore || 0,
            completionRate: data.checkinCompletion?.[0]?.rate || 0,
            topPerformers: data.userSummaries?.slice(0, 3).map((u: any) => u.name) || [],
            atRiskGoals: data.userSummaries?.reduce((s: number, u: any) => s + (u.atRiskGoals || 0), 0) || 0,
            totalGoals: data.totals?.goals || 0,
          },
        }),
      });
      const result = await res.json();
      setNarrative(result.narrative || "Could not generate narrative.");
    } catch {
      setNarrative("Failed to generate narrative.");
    }
    setNarrativeLoading(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#FF4500", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Loading analytics...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "48px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={22} style={{ color: "#FF4500" }} />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Analytics failed to load</h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#FF4500", border: "none", borderRadius: "8px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const totals = data.totals || {};
  const userSummaries = data.userSummaries || [];
  const quarterlyTrend = data.quarterlyTrend || [];
  const checkinCompletion = data.checkinCompletion || [];
  const thrustAreaBreakdown = data.thrustAreaBreakdown || [];
  const statusDistribution = (data.statusDistribution || []).filter((d: any) => d.count > 0);

  return (
    <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Performance Intelligence</p>
          <h1 style={{ fontSize: "40px", fontWeight: 700, color: "white", letterSpacing: "-0.03em", lineHeight: 1.05 }}>Analytics</h1>
        </div>
        <button onClick={() => window.open("/api/reports?format=csv", "_blank")}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "980px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="Total Employees" value={totals.employees ?? 0} icon={Users} accent="#007AFF" />
        <StatCard label="Total Goals" value={totals.goals ?? 0} icon={Target} accent="#FF4500" />
        <StatCard label="Active Goals" value={totals.lockedGoals ?? 0} icon={Activity} accent="#34C759" />
        <StatCard label="Org Avg Score" value={`${totals.avgOrgScore ?? 0}%`} icon={TrendingUp} accent="#FFA500" />
      </div>

      {/* AI Narrative */}
      <div style={{ marginBottom: "32px", padding: "20px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: narrative ? "12px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={14} style={{ color: "#FF4500" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase" }}>AI Narrative</span>
          </div>
          <button onClick={generateNarrative} disabled={narrativeLoading}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: narrative ? "rgba(255,255,255,0.04)" : "#FF4500", border: narrative ? "1px solid rgba(255,255,255,0.08)" : "none", borderRadius: "980px", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: narrativeLoading ? 0.5 : 1, transition: "all 0.2s" }}>
            {narrativeLoading ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Sparkles size={12} />}
            {narrative ? "Regenerate" : "Generate Insight"}
          </button>
        </div>
        {narrative && <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{narrative}</p>}
        {!narrative && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>Generate an AI-powered executive summary of your team's performance.</p>}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* Quarterly Trend */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "20px", letterSpacing: "-0.01em" }}>Quarterly Score Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={quarterlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} formatter={(v: any) => [`${v}%`, "Avg Score"]} />
              <Line type="monotone" dataKey="avgScore" stroke="#FF4500" strokeWidth={2} dot={{ r: 4, fill: "#FF4500", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Check-in Completion */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "20px", letterSpacing: "-0.01em" }}>Check-in Completion Rate</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={checkinCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} unit="%" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} formatter={(v: any) => [`${v}%`, "Completion"]} />
              <Bar dataKey="rate" fill="#34C759" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>

        {/* Thrust Area */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "20px", letterSpacing: "-0.01em" }}>Thrust Area Performance</p>
          {thrustAreaBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={thrustAreaBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} width={120} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} formatter={(v: any) => [`${v}%`, "Avg Score"]} />
                <Bar dataKey="avgScore" fill="#007AFF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>No data yet</p>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "white", marginBottom: "20px", letterSpacing: "-0.01em" }}>Status Distribution</p>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ value }: any) => value}>
                  {statusDistribution.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }} />
                <Legend formatter={(v) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>{v.replace(/_/g, " ")}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>No check-in data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "white", letterSpacing: "-0.01em" }}>Employee Performance</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Employee", "Department", "Goals", "Active", "Avg Score", "At Risk", "Completed"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userSummaries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>
                    No team data available.
                  </td>
                </tr>
              ) : (
                userSummaries.map((user: any) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontWeight: 600, color: "white" }}>{user.name}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{user.email}</p>
                    </td>
                    <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.4)" }}>{user.department || "—"}</td>
                    <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.4)" }}>{user.totalGoals}</td>
                    <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.4)" }}>{user.lockedGoals}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "980px",
                        color: user.avgScore >= 80 ? "#34C759" : user.avgScore >= 60 ? "#007AFF" : "#FF4500",
                        background: user.avgScore >= 80 ? "rgba(52,199,89,0.1)" : user.avgScore >= 60 ? "rgba(0,122,255,0.1)" : "rgba(255,69,0,0.1)",
                        border: `1px solid ${user.avgScore >= 80 ? "rgba(52,199,89,0.2)" : user.avgScore >= 60 ? "rgba(0,122,255,0.2)" : "rgba(255,69,0,0.2)"}`
                      }}>
                        {user.avgScore}%
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {user.atRiskGoals > 0 ? (
                        <span style={{ fontSize: "12px", color: "#FF4500", fontWeight: 600 }}>{user.atRiskGoals}</span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.4)" }}>{user.completedGoals}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
