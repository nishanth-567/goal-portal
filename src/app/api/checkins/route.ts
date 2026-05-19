import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgressScore } from "@/lib/scoring";
import { UoMType } from "@prisma/client";
import { z } from "zod";

const CheckinSchema = z.object({
  goalId: z.string(),
  cycleId: z.string(),
  period: z.enum(["Q1", "Q2", "Q3", "Q4", "ANNUAL"]),
  plannedTarget: z.number().optional(),
  actualAchievement: z.number().optional(),
  completionDate: z.string().optional(),
  progressStatus: z.enum(["NOT_STARTED", "ON_TRACK", "COMPLETED", "AT_RISK"]),
  employeeNote: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const goalId = searchParams.get("goalId");
  const cycleId = searchParams.get("cycleId");
  const userId = searchParams.get("userId") || session.user.id;

  const checkins = await prisma.checkin.findMany({
    where: {
      employeeId: userId,
      ...(goalId ? { goalId } : {}),
      ...(cycleId ? { cycleId } : {}),
    },
    include: {
      goal: { include: { thrustArea: true } },
      employee: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ period: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(checkins);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CheckinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Get goal for score computation
  const goal = await prisma.goal.findUnique({ where: { id: data.goalId } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.status !== "LOCKED") {
    return NextResponse.json({ error: "Can only log check-ins on approved/locked goals." }, { status: 400 });
  }

  // Compute progress score
  const progressScore = computeProgressScore(
    goal.uomType as UoMType,
    goal.target,
    data.actualAchievement ?? null,
    goal.targetDate,
    data.completionDate ? new Date(data.completionDate) : null
  );

  const checkin = await prisma.checkin.upsert({
    where: {
      goalId_period_cycleId: {
        goalId: data.goalId,
        period: data.period as any,
        cycleId: data.cycleId,
      },
    },
    create: {
      goalId: data.goalId,
      employeeId: session.user.id,
      cycleId: data.cycleId,
      period: data.period as any,
      plannedTarget: data.plannedTarget,
      actualAchievement: data.actualAchievement,
      completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
      progressStatus: data.progressStatus as any,
      progressScore,
      employeeNote: data.employeeNote,
      completedAt: new Date(),
    },
    update: {
      plannedTarget: data.plannedTarget,
      actualAchievement: data.actualAchievement,
      completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
      progressStatus: data.progressStatus as any,
      progressScore,
      employeeNote: data.employeeNote,
      completedAt: new Date(),
    },
    include: {
      goal: { include: { thrustArea: true } },
    },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      goalId: data.goalId,
      userId: session.user.id,
      action: "ACHIEVEMENT_UPDATED",
      newValue: `${data.actualAchievement} (${data.period})`,
    },
  });

  return NextResponse.json(checkin, { status: 201 });
}

// Manager adds check-in comment
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only managers can add check-in comments." }, { status: 403 });
  }

  const body = await req.json();
  const { checkinId, managerComment, aiSummary } = body;

  const updated = await prisma.checkin.update({
    where: { id: checkinId },
    data: {
      managerComment,
      managerId: session.user.id,
      ...(aiSummary ? { aiSummary } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      goalId: updated.goalId,
      userId: session.user.id,
      action: "CHECKIN_ADDED",
      note: managerComment,
    },
  });

  return NextResponse.json(updated);
}
