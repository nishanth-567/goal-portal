"use client";
import { Target, CheckSquare, AlertCircle, Clock, TrendingUp, Users, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { getScoreBg } from "@/lib/scoring";

interface Props {
  session: any;
  stats: any;
  teamStats: any;
  cycle: any;
  recentGoals: any[];
}

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-700" },
  SUBMITTED: { label: "Submitted", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-700" },
  RETURNED: { label: "Returned", color: "bg-red-100 text-red-700" },
  LOCKED: { label: "Locked", color: "bg-emerald-100 text-emerald-700" },
};

export function DashboardClient({ session, stats, teamStats, cycle, recentGoals }: Props) {
  const name = session.user.name.split(" ")[0];
  const role = session.user.role;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Good morning, {name} 👋</h1>
        <p className="text-slate-500 mt-1">
          {cycle ? `Active cycle: ${cycle.name} — ${cycle.phase.replace(/_/g, " ")}` : "No active cycle"}
        </p>
      </div>

      {/* My Goal Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">My Goals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Goals" value={stats.totalGoals} icon={Target} color="bg-blue-500" sub={`${stats.totalWeightage}% total weightage`} />
          <StatCard label="Approved & Locked" value={stats.lockedGoals} icon={CheckSquare} color="bg-emerald-500" />
          <StatCard label="Pending Review" value={stats.submittedGoals} icon={Clock} color="bg-amber-500" />
          <StatCard label="Needs Attention" value={stats.returnedGoals} icon={AlertCircle} color="bg-red-500" />
        </div>
      </div>

      {/* Team Stats (Manager/Admin) */}
      {teamStats && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Team Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Team Members" value={teamStats.teamSize} icon={Users} color="bg-violet-500" />
            <StatCard label="Goals Locked" value={teamStats.lockedGoals} icon={CheckSquare} color="bg-emerald-500" sub={`of ${teamStats.totalGoals}`} />
            <StatCard label="Pending Approval" value={teamStats.pendingApproval} icon={Clock} color="bg-amber-500" />
            <StatCard label="At Risk" value={teamStats.atRisk} icon={AlertCircle} color="bg-red-500" />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent goals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Goals</h3>
            <Link href="/goals" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentGoals.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Target size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No goals yet.</p>
                <Link href="/goals/new" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                  Create your first goal →
                </Link>
              </div>
            ) : (
              recentGoals.map((goal) => {
                const cfg = statusConfig[goal.status] || statusConfig.DRAFT;
                const lastCheckin = goal.checkins[goal.checkins.length - 1];
                return (
                  <Link
                    key={goal.id}
                    href={`/goals/${goal.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{goal.title}</p>
                      <p className="text-xs text-slate-400">{goal.thrustArea?.name} · {goal.weightage}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastCheckin?.progressScore != null && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getScoreBg(lastCheckin.progressScore))}>
                          {lastCheckin.progressScore.toFixed(0)}%
                        </span>
                      )}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="space-y-4">
          {/* AI feature card */}
          <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} />
              <span className="font-semibold text-sm">AI Assistant</span>
            </div>
            <p className="text-sm text-white/80 mb-4">
              Let AI help you write better goals, score quality, and summarize check-ins.
            </p>
            <Link
              href="/goals/new"
              className="inline-block bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              Create Goal with AI →
            </Link>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/goals/new" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1.5">
                <Target size={15} /> Create New Goal
              </Link>
              <Link href="/checkins" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1.5">
                <CheckSquare size={15} /> Log Achievement
              </Link>
              {(role === "MANAGER" || role === "ADMIN") && (
                <Link href="/team" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1.5">
                  <Users size={15} /> Review Team Goals
                </Link>
              )}
              {(role === "MANAGER" || role === "ADMIN") && (
                <Link href="/analytics" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1.5">
                  <TrendingUp size={15} /> View Analytics
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
