import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgressScore } from "@/lib/scoring";
import { UoMType } from "@prisma/client";
import { z } from "zod";
import { randomUUID } from "crypto";

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
  try {
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
  } catch (error: any) {
    console.error("GET checkins error:", error);
    return NextResponse.json({ error: "Failed to fetch checkins", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = CheckinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const now = new Date();

    const goal = await prisma.goal.findUnique({ where: { id: data.goalId } });
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    if (goal.status !== "LOCKED") {
      return NextResponse.json({ error: "Can only log check-ins on approved/locked goals." }, { status: 400 });
    }

    const progressScore = computeProgressScore(
      goal.uomType as UoMType,
      goal.target,
      data.actualAchievement ?? null,
      goal.targetDate,
      data.completionDate ? new Date(data.completionDate) : null
    );

    const existing = await prisma.checkin.findFirst({
      where: { goalId: data.goalId, period: data.period as any, cycleId: data.cycleId },
    });

    let checkin;
    if (existing) {
      checkin = await prisma.checkin.update({
        where: { id: existing.id },
        data: {
          plannedTarget: data.plannedTarget,
          actualAchievement: data.actualAchievement,
          completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
          progressStatus: data.progressStatus as any,
          progressScore,
          employeeNote: data.employeeNote,
          completedAt: now,
          updatedAt: now,
        },
        include: { goal: { include: { thrustArea: true } } },
      });
    } else {
      checkin = await prisma.checkin.create({
        data: {
          id: randomUUID(),
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
          completedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        include: { goal: { include: { thrustArea: true } } },
      });
    }

    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        goalId: data.goalId,
        userId: session.user.id,
        action: "ACHIEVEMENT_UPDATED",
        newValue: `${data.actualAchievement} (${data.period})`,
        createdAt: now,
      },
    });

    return NextResponse.json(checkin, { status: 201 });
  } catch (error: any) {
    console.error("POST checkin error:", error);
    return NextResponse.json({ error: "Failed to save checkin", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only managers can add check-in comments." }, { status: 403 });
    }

    const body = await req.json();
    const { checkinId, managerComment, aiSummary } = body;
    const now = new Date();

    const updated = await prisma.checkin.update({
      where: { id: checkinId },
      data: {
        managerComment,
        managerId: session.user.id,
        updatedAt: now,
        ...(aiSummary ? { aiSummary } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        goalId: updated.goalId,
        userId: session.user.id,
        action: "CHECKIN_ADDED",
        note: managerComment,
        createdAt: now,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH checkin error:", error);
    return NextResponse.json({ error: "Failed to update checkin", details: error.message }, { status: 500 });
  }
}
