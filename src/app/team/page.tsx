"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Edit3, Loader2, Users, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  LOCKED: "bg-emerald-100 text-emerald-700",
  RETURNED: "bg-red-100 text-red-700",
};

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [goals, setGoals] = useState<Record<string, any[]>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [editTarget, setEditTarget] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/users?role=EMPLOYEE")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  async function loadGoals(userId: string) {
    if (goals[userId]) return;
    const res = await fetch(`/api/goals?userId=${userId}`);
    const data = await res.json();
    setGoals((prev) => ({ ...prev, [userId]: data }));
  }

  function toggleUser(userId: string) {
    if (expanded === userId) { setExpanded(null); return; }
    setExpanded(userId);
    loadGoals(userId);
  }

  async function handleAction(goalId: string, action: "approve" | "return", userId: string) {
    setApproving(goalId);
    const res = await fetch(`/api/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        managerComment: commentMap[goalId] || "",
        ...(editTarget[goalId] ? { target: parseFloat(editTarget[goalId]) } : {}),
      }),
    });
    const data = await res.json();
    setApproving(null);
    if (res.ok) {
      setGoals((prev) => ({
        ...prev,
        [userId]: prev[userId].map((g) => g.id === goalId ? { ...g, status: data.status, managerComment: data.managerComment } : g),
      }));
      setMessage({ type: "success", text: action === "approve" ? "Goal approved and locked." : "Goal returned for rework." });
    } else {
      setMessage({ type: "error", text: data.error });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Team Goals</h1>
        <p className="text-slate-500 mt-1">Review and approve your team's goal submissions.</p>
      </div>

      {message && (
        <div className={cn("mb-4 p-3 rounded-lg text-sm flex items-center gap-2", message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700")}>
          {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No team members found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const userGoals = goals[user.id] || [];
            const pending = userGoals.filter((g) => g.status === "SUBMITTED").length;
            const isOpen = expanded === user.id;

            return (
              <div key={user.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* User header */}
                <button
                  onClick={() => toggleUser(user.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 flex-shrink-0">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.designation} · {user.department}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {pending > 0 && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {pending} pending approval
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{user._count?.goals || 0} goals</span>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {/* Goals list */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {userGoals.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-slate-400">No goals found for this cycle.</p>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {userGoals.map((goal) => (
                          <div key={goal.id} className="px-5 py-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-slate-800">{goal.title}</p>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[goal.status] || STATUS_STYLES.DRAFT)}>
                                    {goal.status}
                                  </span>
                                  {goal.aiQualityScore && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 flex items-center gap-1">
                                      <Sparkles size={10} /> AI: {goal.aiQualityScore}/100
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-4 text-xs text-slate-400 mb-2">
                                  <span>{goal.thrustArea?.name}</span>
                                  <span>{goal.uomType}</span>
                                  <span>Target: {goal.target ?? "—"} {goal.uomUnit}</span>
                                  <span className="font-medium text-slate-600">{goal.weightage}%</span>
                                </div>
                                {goal.description && (
                                  <p className="text-xs text-slate-500 mb-2">{goal.description}</p>
                                )}
                                {goal.managerComment && (
                                  <p className="text-xs bg-slate-50 rounded px-2 py-1.5 text-slate-600">💬 {goal.managerComment}</p>
                                )}
                              </div>
                            </div>

                            {/* Approval actions for submitted goals */}
                            {goal.status === "SUBMITTED" && (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Edit Target (optional)</label>
                                    <input
                                      type="number"
                                      placeholder={`Current: ${goal.target ?? "N/A"}`}
                                      value={editTarget[goal.id] || ""}
                                      onChange={(e) => setEditTarget((p) => ({ ...p, [goal.id]: e.target.value }))}
                                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Comment</label>
                                    <input
                                      placeholder="Add feedback..."
                                      value={commentMap[goal.id] || ""}
                                      onChange={(e) => setCommentMap((p) => ({ ...p, [goal.id]: e.target.value }))}
                                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAction(goal.id, "approve", user.id)}
                                    disabled={approving === goal.id}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                                  >
                                    {approving === goal.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                    Approve & Lock
                                  </button>
                                  <button
                                    onClick={() => handleAction(goal.id, "return", user.id)}
                                    disabled={approving === goal.id}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <XCircle size={12} /> Return for Rework
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
