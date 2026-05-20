import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ─── GOAL QUALITY SCORER ─────────────────────────────────────────────────────

export interface GoalQualityResult {
  score: number; // 0-100
  clarity: number;
  measurability: number;
  alignment: number;
  feedback: string;
  suggestions: string[];
}

export async function scoreGoalQuality(goal: {
  title: string;
  description?: string;
  thrustArea: string;
  uomType: string;
  target?: number;
  weightage: number;
}): Promise<GoalQualityResult> {
  const prompt = `You are an OKR/goal-setting expert. Evaluate this employee goal and return a JSON quality assessment.

Goal Details:
- Title: ${goal.title}
- Description: ${goal.description || "Not provided"}
- Thrust Area: ${goal.thrustArea}
- Unit of Measurement: ${goal.uomType}
- Target: ${goal.target ?? "Not set"}
- Weightage: ${goal.weightage}%

Score these dimensions from 0-100:
1. clarity: Is the goal clearly written and unambiguous?
2. measurability: Is success clearly measurable with the given UoM and target?
3. alignment: Does it align well with the thrust area?

Overall score = weighted average (clarity 40%, measurability 40%, alignment 20%)

Respond with ONLY valid JSON, no markdown:
{
  "score": number,
  "clarity": number,
  "measurability": number,
  "alignment": number,
  "feedback": "2-3 sentence overall feedback",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  const response = await client.messages.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── SMART GOAL SUGGESTIONS ──────────────────────────────────────────────────

export interface GoalSuggestion {
  title: string;
  description: string;
  uomType: string;
  suggestedTarget: string;
  rationale: string;
}

export async function suggestGoals(context: {
  thrustArea: string;
  designation?: string;
  department?: string;
  existingGoals?: string[];
}): Promise<GoalSuggestion[]> {
  const prompt = `You are an OKR expert helping an employee set meaningful goals.

Context:
- Thrust Area: ${context.thrustArea}
- Designation: ${context.designation || "Employee"}
- Department: ${context.department || "General"}
- Already has goals: ${context.existingGoals?.join(", ") || "None"}

Suggest 3 specific, measurable goals for this thrust area that are not duplicates of existing goals.

Respond with ONLY valid JSON array, no markdown:
[
  {
    "title": "Concise goal title",
    "description": "What success looks like in 1-2 sentences",
    "uomType": "MIN|MAX|TIMELINE|ZERO",
    "suggestedTarget": "e.g., 95%, 30 days, ₹50L",
    "rationale": "Why this goal matters for this role"
  }
]`;

  const response = await client.messages.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── NATURAL LANGUAGE GOAL PARSER ────────────────────────────────────────────

export interface ParsedGoal {
  title: string;
  description: string;
  uomType: "MIN" | "MAX" | "TIMELINE" | "ZERO";
  target?: number;
  targetDate?: string;
  uomUnit?: string;
}

export async function parseNaturalLanguageGoal(
  input: string,
  thrustArea: string
): Promise<ParsedGoal> {
  const prompt = `Parse this natural language goal description into a structured goal object.

Input: "${input}"
Thrust Area: ${thrustArea}

UoM Types:
- MIN: Higher is better (sales, revenue, scores) — formula: Achievement/Target
- MAX: Lower is better (cost, TAT, errors) — formula: Target/Achievement  
- TIMELINE: Date-based completion
- ZERO: Zero occurrences = success (safety incidents, defects)

Respond with ONLY valid JSON, no markdown:
{
  "title": "Concise goal title (max 80 chars)",
  "description": "What success looks like",
  "uomType": "MIN|MAX|TIMELINE|ZERO",
  "target": number or null,
  "targetDate": "YYYY-MM-DD" or null,
  "uomUnit": "unit string e.g. %, ₹ Lakhs, Days" or null
}`;

  const response = await client.messages.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── CHECK-IN SUMMARIZER ─────────────────────────────────────────────────────

export interface CheckinSummary {
  narrative: string;
  keyHighlights: string[];
  areasOfConcern: string[];
  recommendedActions: string[];
  overallSentiment: "positive" | "neutral" | "needs_attention";
}

export async function summarizeCheckin(data: {
  employeeName: string;
  period: string;
  goals: {
    title: string;
    target?: number;
    achievement?: number;
    progressScore?: number;
    status: string;
    employeeNote?: string;
    managerComment?: string;
  }[];
}): Promise<CheckinSummary> {
  const goalsText = data.goals
    .map(
      (g, i) =>
        `${i + 1}. ${g.title}
   Target: ${g.target ?? "N/A"}, Achievement: ${g.achievement ?? "N/A"}, Score: ${g.progressScore?.toFixed(1) ?? "N/A"}%
   Status: ${g.status}
   Employee note: ${g.employeeNote || "None"}
   Manager comment: ${g.managerComment || "None"}`
    )
    .join("\n\n");

  const prompt = `You are an HR performance specialist. Summarize this ${data.period} check-in for ${data.employeeName}.

Goals Progress:
${goalsText}

Write a professional performance summary. Respond with ONLY valid JSON, no markdown:
{
  "narrative": "2-3 paragraph professional narrative summary",
  "keyHighlights": ["highlight 1", "highlight 2"],
  "areasOfConcern": ["concern 1"] or [],
  "recommendedActions": ["action 1", "action 2"],
  "overallSentiment": "positive|neutral|needs_attention"
}`;

  const response = await client.messages.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── ANALYTICS NARRATIVE ─────────────────────────────────────────────────────

export async function generateAnalyticsNarrative(data: {
  period: string;
  teamName?: string;
  avgScore: number;
  completionRate: number;
  topPerformers: string[];
  atRiskGoals: number;
  totalGoals: number;
}): Promise<string> {
  const prompt = `Generate a concise executive-style analytics narrative (3-4 sentences) for this performance data.

Period: ${data.period}
Team: ${data.teamName || "Organization"}
Average Score: ${data.avgScore.toFixed(1)}%
Check-in Completion Rate: ${data.completionRate.toFixed(1)}%
At-Risk Goals: ${data.atRiskGoals} of ${data.totalGoals}
Top Performers: ${data.topPerformers.join(", ") || "N/A"}

Write in a direct, professional tone. Highlight what's working and what needs attention. No bullet points, just prose.`;

  const response = await client.messages.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
