import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

const CreateGoalSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().optional(),
  thrustAreaId: z.string(),
  uomType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]),
  uomUnit: z.string().optional(),
  target: z.number().optional(),
  targetDate: z.string().optional(),
  weightage: z.number().min(10).max(100),
  cycleId: z.string(),
  aiQualityScore: z.number().optional(),
  aiSuggestions: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");
    const userId = searchParams.get("userId") || session.user.id;

    if (userId !== session.user.id && session.user.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        ownerId: userId,
        ...(cycleId ? { cycleId } : {}),
      },
      include: {
        thrustArea: true,
        checkins: { orderBy: { period: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error: any) {
    console.error("GET goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const existingGoals = await prisma.goal.findMany({
      where: { ownerId: session.user.id, cycleId: data.cycleId },
      select: { weightage: true },
    });

    if (existingGoals.length >= 8) {
      return NextResponse.json({ error: "Maximum 8 goals allowed per employee." }, { status: 400 });
    }

    if (data.weightage < 10) {
      return NextResponse.json({ error: "Minimum weightage per goal is 10%." }, { status: 400 });
    }

    const now = new Date();
    const goal = await prisma.goal.create({
      data: {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        thrustAreaId: data.thrustAreaId,
        uomType: data.uomType as any,
        uomUnit: data.uomUnit,
        target: data.target,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        weightage: data.weightage,
        cycleId: data.cycleId,
        ownerId: session.user.id,
        aiQualityScore: data.aiQualityScore,
        aiSuggestions: data.aiSuggestions,
        createdAt: now,
        updatedAt: now,
      },
      include: { thrustArea: true },
    });

    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        goalId: goal.id,
        userId: session.user.id,
        action: "CREATED",
        note: `Goal created: ${goal.title}`,
        createdAt: now,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    console.error("POST goals error:", error);
    return NextResponse.json({ error: "Failed to create goal", details: error.message }, { status: 500 });
  }
}
