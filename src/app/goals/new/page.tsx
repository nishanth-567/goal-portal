"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Loader2, Plus, AlertCircle, CheckCircle,
  Wand2, ChevronDown, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const UOM_OPTIONS = [
  { value: "MIN", label: "MIN — Higher is Better", desc: "e.g. Revenue, Score, Retention" },
  { value: "MAX", label: "MAX — Lower is Better", desc: "e.g. TAT, Cost, Error Rate" },
  { value: "TIMELINE", label: "Timeline — Date Based", desc: "e.g. Project delivery by date" },
  { value: "ZERO", label: "Zero — Zero = Success", desc: "e.g. Safety incidents, Defects" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [thrustAreas, setThrustAreas] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiScore, setAiScore] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [nlInput, setNlInput] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    thrustAreaId: "",
    uomType: "MIN",
    uomUnit: "",
    target: "",
    targetDate: "",
    weightage: "",
    cycleId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/thrust-areas").then((r) => r.json()),
      fetch("/api/cycles").then((r) => r.json()),
    ]).then(([ta, cy]) => {
      setThrustAreas(ta);
      setCycles(cy);
      if (cy.length > 0) setForm((f) => ({ ...f, cycleId: cy[0].id }));
    });
  }, []);

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setAiScore(null);
  }

  // ── AI: Parse Natural Language ────────────────────────────────────────────
  async function handleNLParse() {
    if (!nlInput.trim() || !form.thrustAreaId) return;
    setNlLoading(true);
    const ta = thrustAreas.find((t) => t.id === form.thrustAreaId);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parse_nl_goal", input: nlInput, thrustArea: ta?.name }),
      });
      const parsed = await res.json();
      setForm((f) => ({
        ...f,
        title: parsed.title || f.title,
        description: parsed.description || f.description,
        uomType: parsed.uomType || f.uomType,
        target: parsed.target?.toString() || f.target,
        targetDate: parsed.targetDate || f.targetDate,
        uomUnit: parsed.uomUnit || f.uomUnit,
      }));
      setNlInput("");
    } catch {
      setError("AI parsing failed. Please fill fields manually.");
    }
    setNlLoading(false);
  }

  // ── AI: Score Goal Quality ────────────────────────────────────────────────
  async function handleScoreGoal() {
    if (!form.title || !form.thrustAreaId) return;
    setAiLoading(true);
    const ta = thrustAreas.find((t) => t.id === form.thrustAreaId);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score_goal",
          goal: {
            title: form.title,
            description: form.description,
            thrustArea: ta?.name,
            uomType: form.uomType,
            target: form.target ? parseFloat(form.target) : undefined,
            weightage: form.weightage ? parseFloat(form.weightage) : 0,
          },
        }),
      });
      const score = await res.json();
      setAiScore(score);
    } catch {
      setError("AI scoring failed.");
    }
    setAiLoading(false);
  }

  // ── AI: Suggest Goals ─────────────────────────────────────────────────────
  async function handleSuggestGoals() {
    if (!form.thrustAreaId) return;
    setSuggestLoading(true);
    const ta = thrustAreas.find((t) => t.id === form.thrustAreaId);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_goals",
          context: { thrustArea: ta?.name, existingGoals: [] },
        }),
      });
      const suggestions = await res.json();
      setAiSuggestions(suggestions);
    } catch {
      setError("AI suggestions failed.");
    }
    setSuggestLoading(false);
  }

  function applySuggestion(s: any) {
    setForm((f) => ({
      ...f,
      title: s.title,
      description: s.description,
      uomType: s.uomType,
    }));
    setAiSuggestions([]);
    setAiScore(null);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: any = {
      title: form.title,
      description: form.description,
      thrustAreaId: form.thrustAreaId,
      uomType: form.uomType,
      uomUnit: form.uomUnit,
      weightage: parseFloat(form.weightage),
      cycleId: form.cycleId,
    };
    if (form.target) body.target = parseFloat(form.target);
    if (form.targetDate) body.targetDate = form.targetDate;
    if (aiScore) {
      body.aiQualityScore = aiScore.score;
      body.aiSuggestions = JSON.stringify(aiScore.suggestions);
    }

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create goal.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/goals"), 1500);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Create New Goal</h1>
        <p className="text-slate-500 mt-1">Define a measurable goal for the current performance cycle.</p>
      </div>

      {/* AI NL Input */}
      <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 size={16} className="text-violet-600" />
          <span className="text-sm font-semibold text-violet-700">AI Goal Builder</span>
          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Describe your goal in plain language. AI will parse it into a structured form.</p>
        <div className="flex gap-2">
          <input
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder='e.g. "I want to reduce customer complaints by 20% this year"'
            className="flex-1 px-3 py-2 text-sm border border-violet-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            type="button"
            onClick={handleNLParse}
            disabled={nlLoading || !nlInput.trim() || !form.thrustAreaId}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {nlLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Parse
          </button>
        </div>
        {!form.thrustAreaId && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Info size={11} /> Select a Thrust Area first to enable AI parsing.
          </p>
        )}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 p-4 bg-white border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-slate-700 mb-3">AI Suggested Goals — click to apply:</p>
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => applySuggestion(s)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                <p className="text-xs text-blue-600 mt-1">UoM: {s.uomType} · Target: {s.suggestedTarget}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cycle + Thrust Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cycle <span className="text-red-500">*</span></label>
            <select
              value={form.cycleId}
              onChange={(e) => setField("cycleId", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select cycle...</option>
              {cycles.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thrust Area <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select
                value={form.thrustAreaId}
                onChange={(e) => setField("thrustAreaId", e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select thrust area...</option>
                {thrustAreas.map((ta: any) => (
                  <option key={ta.id} value={ta.id}>{ta.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSuggestGoals}
                disabled={!form.thrustAreaId || suggestLoading}
                className="px-3 py-2 border border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 rounded-lg text-violet-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="Get AI goal suggestions"
              >
                {suggestLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Suggest
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Goal Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Increase Q3 Sales Revenue"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={200}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe what success looks like..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* UoM Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Unit of Measurement <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {UOM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField("uomType", opt.value)}
                className={cn(
                  "text-left px-4 py-3 rounded-lg border-2 transition-colors",
                  form.uomType === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target + Unit + Date */}
        <div className="grid grid-cols-3 gap-4">
          {form.uomType !== "ZERO" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {form.uomType === "TIMELINE" ? "Target Date" : "Target Value"}
              </label>
              {form.uomType === "TIMELINE" ? (
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setField("targetDate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="number"
                  value={form.target}
                  onChange={(e) => setField("target", e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Label</label>
            <input
              value={form.uomUnit}
              onChange={(e) => setField("uomUnit", e.target.value)}
              placeholder="e.g. %, ₹ Lakhs, Days"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Weightage (%) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={form.weightage}
              onChange={(e) => setField("weightage", e.target.value)}
              placeholder="Min 10%"
              min={10}
              max={100}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* AI Quality Score */}
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleScoreGoal}
            disabled={aiLoading || !form.title}
            className="flex items-center gap-2 px-4 py-2 border border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 text-violet-700 rounded-lg text-sm font-medium transition-colors"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Score Goal Quality with AI
          </button>

          {aiScore && (
            <div className="flex-1 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "text-lg font-bold",
                  aiScore.score >= 80 ? "text-emerald-600" : aiScore.score >= 60 ? "text-amber-600" : "text-red-600"
                )}>
                  {aiScore.score}/100
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", aiScore.score >= 80 ? "bg-emerald-500" : aiScore.score >= 60 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${aiScore.score}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-2">{aiScore.feedback}</p>
              {aiScore.suggestions?.length > 0 && (
                <ul className="space-y-1">
                  {aiScore.suggestions.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                      <span className="text-violet-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            <CheckCircle size={16} /> Goal created successfully! Redirecting...
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Goal
          </button>
          <button
            type="button"
            onClick={() => router.push("/goals")}
            className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
