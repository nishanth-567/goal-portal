import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  scoreGoalQuality,
  suggestGoals,
  parseNaturalLanguageGoal,
  summarizeCheckin,
  generateAnalyticsNarrative,
} from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, ...data } = body;

  try {
    switch (action) {
      case "score_goal": {
        const result = await scoreGoalQuality(data.goal);
        return NextResponse.json(result);
      }

      case "suggest_goals": {
        const result = await suggestGoals(data.context);
        return NextResponse.json(result);
      }

      case "parse_nl_goal": {
        const result = await parseNaturalLanguageGoal(data.input, data.thrustArea);
        return NextResponse.json(result);
      }

      case "summarize_checkin": {
        if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "Only managers can generate summaries." }, { status: 403 });
        }
        const result = await summarizeCheckin(data.checkinData);
        return NextResponse.json(result);
      }

      case "analytics_narrative": {
        if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const result = await generateAnalyticsNarrative(data.analyticsData);
        return NextResponse.json({ narrative: result });
      }

      default:
        return NextResponse.json({ error: "Unknown AI action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("AI API error:", err);
    return NextResponse.json({ error: "AI service error", details: err.message }, { status: 500 });
  }
}
