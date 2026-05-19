"use client";
import { useState, useEffect } from "react";
import { Download, FileText, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

export default function ReportsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cycles").then((r) => r.json()).then((data) => {
      setCycles(data);
      const active = data.find((c: any) => c.isActive);
      if (active) setSelectedCycle(active.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCycle) return;
    setLoading(true);
    fetch(`/api/reports?cycleId=${selectedCycle}`)
      .then((r) => r.json())
      .then((data) => { setGoals(Array.isArray(data) ? data : []); setLoading(false); });
  }, [selectedCycle]);

  function exportCSV() {
    window.open(`/api/reports?cycleId=${selectedCycle}&format=csv`, "_blank");
  }

  const completedCount = goals.filter((g) => g.checkins?.some((c: any) => c.progressStatus === "COMPLETED")).length;
  const atRiskCount = goals.filter((g) => g.checkins?.some((c: any) => c.progressStatus === "AT_RISK")).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500 mt-1">Achievement report — Planned vs Actual across all employees.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Locked Goals", value: goals.length, icon: FileText, color: "bg-blue-500" },
          { label: "Completed", value: completedCount, icon: CheckCircle, color: "bg-emerald-500" },
          { label: "At Risk", value: atRiskCount, icon: Clock, color: "bg-red-500" },
          { label: "Completion Rate", value: goals.length > 0 ? `${Math.round((completedCount / goals.length) * 100)}%` : "—", icon: CheckCircle, color: "bg-violet-500" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", kpi.color)}>
                <Icon size={18} className="text-white" />
              </div>
              <div><p className="text-xl font-bold text-slate-800">{kpi.value}</p><p className="text-xs text-slate-500">{kpi.label}</p></div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">Achievement Report</div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>{["Employee", "Thrust Area", "Goal", "UoM", "Target", "Wt%", "Q1", "Q2", "Q3", "Q4", "Status"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {goals.map((goal) => {
                  const getQ = (p: string) => goal.checkins?.find((c: any) => c.period === p);
                  const lastStatus = goal.checkins?.[goal.checkins.length - 1]?.progressStatus || "NOT_STARTED";
                  return (
                    <tr key={goal.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3"><p className="font-medium text-slate-800 whitespace-nowrap">{goal.owner?.name}</p><p className="text-xs text-slate-400">{goal.owner?.department}</p></td>
                      <td className="px-3 py-3 text-slate-600 text-xs">{goal.thrustArea?.name}</td>
                      <td className="px-3 py-3 max-w-[200px]"><p className="text-slate-800 truncate" title={goal.title}>{goal.title}</p></td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{goal.uomType}</td>
                      <td className="px-3 py-3 text-slate-600">{goal.target ?? "—"} {goal.uomUnit}</td>
                      <td className="px-3 py-3 font-medium text-slate-700">{goal.weightage}%</td>
                      {["Q1", "Q2", "Q3", "Q4"].map((p) => {
                        const q = getQ(p);
                        return (
                          <td key={p} className="px-3 py-3">
                            {q ? (
                              <div>
                                <p className="text-xs text-slate-500">{q.actualAchievement ?? "—"}/{q.plannedTarget ?? "—"}</p>
                                {q.progressScore != null && <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getScoreBg(q.progressScore))}>{q.progressScore.toFixed(0)}%</span>}
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                          lastStatus === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                          lastStatus === "ON_TRACK" ? "bg-blue-100 text-blue-700" :
                          lastStatus === "AT_RISK" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                        )}>{lastStatus.replace(/_/g, " ")}</span>
                      </td>
                    </tr>
                  );
                })}
                {goals.length === 0 && <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-400">No data for this cycle.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
