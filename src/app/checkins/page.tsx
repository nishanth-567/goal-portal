"use client";
import { useState, useEffect } from "react";
import { CheckSquare, Loader2, Save, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

const PERIODS = ["Q1", "Q2", "Q3", "Q4", "ANNUAL"];
const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started", color: "bg-slate-100 text-slate-600" },
  { value: "ON_TRACK", label: "On Track", color: "bg-blue-100 text-blue-700" },
  { value: "AT_RISK", label: "At Risk", color: "bg-amber-100 text-amber-700" },
  { value: "COMPLETED", label: "Completed", color: "bg-emerald-100 text-emerald-700" },
];

export default function CheckinsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState("Q2");
  const [saving, setSaving] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => {
        const locked = data.filter((g: any) => g.status === "LOCKED");
        setGoals(locked);
        // Pre-fill forms from existing checkins
        const initial: Record<string, any> = {};
        for (const g of locked) {
          const existing = g.checkins?.find((c: any) => c.period === activePeriod);
          initial[g.id] = {
            plannedTarget: existing?.plannedTarget ?? g.target ?? "",
            actualAchievement: existing?.actualAchievement ?? "",
            progressStatus: existing?.progressStatus ?? "NOT_STARTED",
            employeeNote: existing?.employeeNote ?? "",
            completionDate: existing?.completionDate?.split("T")[0] ?? "",
          };
        }
        setForms(initial);
        setLoading(false);
      });
  }, [activePeriod]);

  function updateForm(goalId: string, key: string, value: string) {
    setForms((prev) => ({ ...prev, [goalId]: { ...prev[goalId], [key]: value } }));
  }

  async function saveCheckin(goal: any) {
    setSaving(goal.id);
    const f = forms[goal.id];

    // Find active cycle
    const cycleRes = await fetch("/api/cycles");
    const cycles = await cycleRes.json();
    const cycle = cycles.find((c: any) => c.isActive);
    if (!cycle) { setMessage("No active cycle found."); setSaving(null); return; }

    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId: goal.id,
        cycleId: cycle.id,
        period: activePeriod,
        plannedTarget: f.plannedTarget ? parseFloat(f.plannedTarget) : undefined,
        actualAchievement: f.actualAchievement ? parseFloat(f.actualAchievement) : undefined,
        completionDate: f.completionDate || undefined,
        progressStatus: f.progressStatus,
        employeeNote: f.employeeNote,
      }),
    });

    const data = await res.json();
    setSaving(null);
    if (res.ok) {
      setGoals((prev) => prev.map((g) => {
        if (g.id !== goal.id) return g;
        const updatedCheckins = g.checkins.filter((c: any) => c.period !== activePeriod);
        return { ...g, checkins: [...updatedCheckins, data] };
      }));
      setMessage("Check-in saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(data.error || "Failed to save.");
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Quarterly Check-ins</h1>
        <p className="text-slate-500 mt-1">Log your actual achievement against planned targets.</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activePeriod === p ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          {message}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <CheckSquare size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No approved goals yet</p>
          <p className="text-slate-400 text-sm mt-1">Goals must be approved and locked before you can log check-ins.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const f = forms[goal.id] || {};
            const existingCheckin = goal.checkins?.find((c: any) => c.period === activePeriod);
            const isOpen = expanded === goal.id;

            return (
              <div key={goal.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : goal.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{goal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{goal.thrustArea?.name} · {goal.uomType} · {goal.weightage}% · Target: {goal.target} {goal.uomUnit}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {existingCheckin ? (
                      <>
                        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getScoreBg(existingCheckin.progressScore ?? 0))}>
                          {(existingCheckin.progressScore ?? 0).toFixed(0)}%
                        </span>
                        <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
                          STATUS_OPTIONS.find(s => s.value === existingCheckin.progressStatus)?.color || "bg-slate-100 text-slate-600"
                        )}>
                          {STATUS_OPTIONS.find(s => s.value === existingCheckin.progressStatus)?.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Not logged</span>
                    )}
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {goal.uomType !== "TIMELINE" && goal.uomType !== "ZERO" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Planned Target ({goal.uomUnit || "units"})</label>
                            <input
                              type="number"
                              value={f.plannedTarget ?? ""}
                              onChange={(e) => updateForm(goal.id, "plannedTarget", e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder={`Goal target: ${goal.target}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Actual Achievement ({goal.uomUnit || "units"})</label>
                            <input
                              type="number"
                              value={f.actualAchievement ?? ""}
                              onChange={(e) => updateForm(goal.id, "actualAchievement", e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Enter actual value"
                            />
                          </div>
                        </>
                      )}
                      {goal.uomType === "TIMELINE" && (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Completion Date</label>
                          <input
                            type="date"
                            value={f.completionDate ?? ""}
                            onChange={(e) => updateForm(goal.id, "completionDate", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                        <select
                          value={f.progressStatus ?? "NOT_STARTED"}
                          onChange={(e) => updateForm(goal.id, "progressStatus", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Your Note (optional)</label>
                      <textarea
                        value={f.employeeNote ?? ""}
                        onChange={(e) => updateForm(goal.id, "employeeNote", e.target.value)}
                        rows={2}
                        placeholder="Add context, blockers, or highlights..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>
                    <button
                      onClick={() => saveCheckin(goal)}
                      disabled={saving === goal.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {saving === goal.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Check-in
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
