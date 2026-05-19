import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateGoalSheet } from "@/lib/scoring";
import { z } from "zod";

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
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cycleId = searchParams.get("cycleId");
  const userId = searchParams.get("userId") || session.user.id;

  // Managers and Admins can view other users' goals
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
      _count: { select: { auditLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Check goal count limit
  const existingGoals = await prisma.goal.findMany({
    where: { ownerId: session.user.id, cycleId: data.cycleId },
    select: { weightage: true },
  });

  if (existingGoals.length >= 8) {
    return NextResponse.json(
      { error: "Maximum 8 goals allowed per employee." },
      { status: 400 }
    );
  }

  // Validate weightage with new goal included
  const allWeightages = [...existingGoals.map((g) => ({ weightage: g.weightage })), { weightage: data.weightage }];

  // Don't enforce 100% sum at creation time — only at submission
  if (data.weightage < 10) {
    return NextResponse.json(
      { error: "Minimum weightage per goal is 10%." },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.create({
    data: {
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
    },
    include: { thrustArea: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      goalId: goal.id,
      userId: session.user.id,
      action: "CREATED",
      note: `Goal created: ${goal.title}`,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
