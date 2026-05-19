"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Target, Filter, Send, Lock, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  RETURNED: "bg-red-100 text-red-700",
  LOCKED: "bg-emerald-100 text-emerald-700",
};

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
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Goals</h1>
          <p className="text-slate-500 mt-0.5">
            {goals.length} goals · {totalWeightage}% total weightage
            {!weightageOk && goals.length > 0 && (
              <span className="ml-2 text-amber-600 text-sm">
                ⚠ Must total 100% to submit
              </span>
            )}
          </p>
        </div>
        <Link
          href="/goals/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Goal
        </Link>
      </div>

      {message && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} /> {message}
          <button onClick={() => setMessage("")} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Weightage progress bar */}
      {goals.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Total Weightage</span>
            <span className={cn("text-sm font-semibold", weightageOk ? "text-emerald-600" : "text-amber-600")}>
              {totalWeightage}% / 100%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", totalWeightage > 100 ? "bg-red-500" : weightageOk ? "bg-emerald-500" : "bg-amber-500")}
              style={{ width: `${Math.min(totalWeightage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Min 10% per goal · Max 8 goals · Must total 100% to submit</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["ALL", "DRAFT", "SUBMITTED", "LOCKED", "RETURNED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === s ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            {s !== "ALL" && (
              <span className="ml-1 opacity-70">({goals.filter((g) => g.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Target size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-slate-600 font-medium">No goals found</h3>
          <p className="text-slate-400 text-sm mt-1">Create your first goal to get started.</p>
          <Link href="/goals/new" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Create Goal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => {
            const lastCheckin = goal.checkins?.[goal.checkins.length - 1];
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/goals/${goal.id}`} className="font-semibold text-slate-800 hover:text-blue-600 truncate">
                        {goal.title}
                      </Link>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", STATUS_STYLES[goal.status])}>
                        {goal.status === "LOCKED" ? "✓ Approved" : goal.status.charAt(0) + goal.status.slice(1).toLowerCase()}
                      </span>
                      {goal.aiQualityScore && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 flex items-center gap-1 flex-shrink-0">
                          <Sparkles size={10} /> {goal.aiQualityScore}/100
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{goal.thrustArea?.name}</span>
                      <span>·</span>
                      <span>{goal.uomType}</span>
                      {goal.target && <><span>·</span><span>Target: {goal.target} {goal.uomUnit}</span></>}
                      <span>·</span>
                      <span className="font-medium text-slate-600">{goal.weightage}%</span>
                    </div>
                    {goal.managerComment && (
                      <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                        💬 Manager: {goal.managerComment}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lastCheckin?.progressScore != null && (
                      <span className={cn("text-xs px-2 py-1 rounded-lg font-medium", getScoreBg(lastCheckin.progressScore))}>
                        {lastCheckin.progressScore.toFixed(0)}% score
                      </span>
                    )}
                    {(goal.status === "DRAFT" || goal.status === "RETURNED") && (
                      <button
                        onClick={() => submitGoal(goal.id)}
                        disabled={submitting === goal.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
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
