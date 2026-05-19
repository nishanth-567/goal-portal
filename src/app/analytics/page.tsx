"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Sparkles, Loader2, Download, TrendingUp, Users, Target, AlertCircle } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-slate-500">Failed to load analytics.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 mt-1">Performance insights across your team</p>
        </div>
        <button
          onClick={() => window.open("/api/reports?format=csv", "_blank")}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Employees", value: data.totals.employees, icon: Users, color: "bg-blue-500" },
          { label: "Total Goals", value: data.totals.goals, icon: Target, color: "bg-violet-500" },
          { label: "Locked Goals", value: data.totals.lockedGoals, icon: Target, color: "bg-emerald-500" },
          { label: "Org Avg Score", value: `${data.totals.avgOrgScore}%`, icon: TrendingUp, color: "bg-amber-500" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", kpi.color)}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <p className="text-sm text-slate-500">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Narrative */}
      <div className="mb-8 p-5 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-600" />
            <span className="font-semibold text-violet-800">AI Performance Narrative</span>
          </div>
          <button
            onClick={generateNarrative}
            disabled={narrativeLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {narrativeLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Insight
          </button>
        </div>
        {narrative ? (
          <p className="text-sm text-slate-700 leading-relaxed">{narrative}</p>
        ) : (
          <p className="text-sm text-slate-500">Click "Generate Insight" to get an AI-powered summary of your team's performance.</p>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Quarterly Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quarterly Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.quarterlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v: any) => [`${v}%`, "Avg Score"]} />
              <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Check-in Completion */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Check-in Completion Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.checkinCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v: any) => [`${v}%`, "Completion"]} />
              <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Thrust Area Breakdown */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Thrust Area Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.thrustAreaBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Avg Score"]} />
              <Bar dataKey="avgScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Status Distribution</h3>
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
              <Tooltip />
              <Legend formatter={(v) => v.replace(/_/g, " ")} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Employee Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Employee", "Department", "Goals", "Locked", "Avg Score", "At Risk", "Completed"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.userSummaries.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.department || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{user.totalGoals}</td>
                  <td className="px-4 py-3 text-slate-600">{user.lockedGoals}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getScoreBg(user.avgScore))}>
                      {user.avgScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.atRiskGoals > 0 ? (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle size={12} /> {user.atRiskGoals}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.completedGoals}</td>
                </tr>
              ))}
              {data.userSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No team data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
