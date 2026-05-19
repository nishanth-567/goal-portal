"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2, Users, RefreshCw, Shield } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [thrustAreas, setThrustAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "cycles" | "thrust">("users");

  // New user form
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "EMPLOYEE", department: "", designation: "", employeeId: "" });
  const [userSaving, setUserSaving] = useState(false);
  const [userMsg, setUserMsg] = useState("");

  // New cycle form
  const [cycleForm, setCycleForm] = useState({ name: "", startDate: "", endDate: "" });
  const [cycleSaving, setCycleSaving] = useState(false);

  // New thrust area form
  const [taForm, setTaForm] = useState({ name: "", description: "" });
  const [taSaving, setTaSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/cycles").then((r) => r.json()),
      fetch("/api/thrust-areas").then((r) => r.json()),
    ]).then(([u, c, t]) => { setUsers(u); setCycles(c); setThrustAreas(t); setLoading(false); });
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setUserSaving(true);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...userForm, password: "Welcome@123" }) });
    const data = await res.json();
    setUserSaving(false);
    if (res.ok) { setUsers((p) => [...p, data]); setUserMsg("User created! Default password: Welcome@123"); setUserForm({ name: "", email: "", role: "EMPLOYEE", department: "", designation: "", employeeId: "" }); }
    else setUserMsg(data.error);
  }

  async function createCycle(e: React.FormEvent) {
    e.preventDefault();
    setCycleSaving(true);
    const res = await fetch("/api/cycles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cycleForm) });
    const data = await res.json();
    setCycleSaving(false);
    if (res.ok) { setCycles((p) => [data, ...p]); setCycleForm({ name: "", startDate: "", endDate: "" }); }
  }

  async function createThrustArea(e: React.FormEvent) {
    e.preventDefault();
    setTaSaving(true);
    const res = await fetch("/api/thrust-areas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taForm) });
    const data = await res.json();
    setTaSaving(false);
    if (res.ok) { setThrustAreas((p) => [...p, data]); setTaForm({ name: "", description: "" }); }
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={24} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-500 text-sm">Manage users, cycles, and configuration.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: "users", label: `Users (${users.length})` }, { key: "cycles", label: `Cycles (${cycles.length})` }, { key: "thrust", label: `Thrust Areas (${thrustAreas.length})` }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">All Users</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr>{["Name", "Email", "Role", "Department", "Emp ID"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-red-100 text-red-700" : u.role === "MANAGER" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                      <td className="px-4 py-3 text-slate-500">{u.department || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{u.employeeId || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Add User</h3>
            {userMsg && <p className="mb-3 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">{userMsg}</p>}
            <form onSubmit={createUser} className="space-y-3">
              {[["name", "Full Name"], ["email", "Email"], ["employeeId", "Employee ID"], ["department", "Department"], ["designation", "Designation"]].map(([k, l]) => (
                <div key={k}><label className="block text-xs font-medium text-slate-600 mb-1">{l}</label>
                  <input value={(userForm as any)[k]} onChange={(e) => setUserForm((p) => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required={k === "name" || k === "email"} /></div>
              ))}
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>EMPLOYEE</option><option>MANAGER</option><option>ADMIN</option>
                </select></div>
              <button type="submit" disabled={userSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {userSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cycles Tab */}
      {tab === "cycles" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">Performance Cycles</div>
            <div className="divide-y divide-slate-50">
              {cycles.map((c) => (
                <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1"><p className="font-medium text-slate-800">{c.name}</p><p className="text-xs text-slate-400">{new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{c.phase.replace(/_/g, " ")}</span>
                    {c.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">New Cycle</h3>
            <form onSubmit={createCycle} className="space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Cycle Name</label><input value={cycleForm.name} onChange={(e) => setCycleForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. FY 2026-27" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label><input type="date" value={cycleForm.startDate} onChange={(e) => setCycleForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label><input type="date" value={cycleForm.endDate} onChange={(e) => setCycleForm((p) => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
              <button type="submit" disabled={cycleSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {cycleSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Cycle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Thrust Areas Tab */}
      {tab === "thrust" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">Thrust Areas</div>
            <div className="divide-y divide-slate-50">
              {thrustAreas.map((ta) => (
                <div key={ta.id} className="px-5 py-4">
                  <p className="font-medium text-slate-800">{ta.name}</p>
                  {ta.description && <p className="text-xs text-slate-400 mt-0.5">{ta.description}</p>}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">New Thrust Area</h3>
            <form onSubmit={createThrustArea} className="space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Name</label><input value={taForm.name} onChange={(e) => setTaForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><textarea value={taForm.description} onChange={(e) => setTaForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" /></div>
              <button type="submit" disabled={taSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {taSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Thrust Area
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
