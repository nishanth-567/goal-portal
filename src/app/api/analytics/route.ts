import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSheetScore } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const cycleId = searchParams.get("cycleId");

    let userFilter: any = {};
    if (session.user.role === "MANAGER") {
      userFilter = { managerId: session.user.id };
    }

    const users = await prisma.user.findMany({
      where: { ...userFilter, isActive: true, role: "EMPLOYEE" },
      select: {
        id: true, name: true, email: true, department: true,
        goals: {
          where: { ...(cycleId ? { cycleId } : {}) },
          include: { checkins: true, thrustArea: true },
        },
      },
    });

    const userSummaries = users.map((user) => {
      const lockedGoals = user.goals.filter((g) => g.status === "LOCKED");
      const checkinScores = lockedGoals.flatMap((g) =>
        g.checkins.map((c) => ({ weightage: g.weightage, progressScore: c.progressScore ?? 0 }))
      );
      const avgScore = checkinScores.length > 0 ? computeSheetScore(checkinScores) : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        totalGoals: user.goals.length,
        lockedGoals: lockedGoals.length,
        avgScore: Math.round(avgScore * 10) / 10,
        completedGoals: lockedGoals.filter((g) =>
          g.checkins.some((c) => c.progressStatus === "COMPLETED")
        ).length,
        atRiskGoals: lockedGoals.filter((g) =>
          g.checkins.some((c) => c.progressStatus === "AT_RISK")
        ).length,
      };
    });

    const allGoals = users.flatMap((u) => u.goals);
    const allCheckins = allGoals.flatMap((g) => g.checkins);

    const thrustAreaMap: Record<string, { name: string; count: number; totalScore: number }> = {};
    for (const goal of allGoals) {
      const name = goal.thrustArea?.name || "Unknown";
      if (!thrustAreaMap[name]) thrustAreaMap[name] = { name, count: 0, totalScore: 0 };
      thrustAreaMap[name].count += 1;
      const scores = goal.checkins.map((c) => c.progressScore ?? 0);
      thrustAreaMap[name].totalScore += scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
    }
    const thrustAreaBreakdown = Object.values(thrustAreaMap).map((ta) => ({
      name: ta.name,
      count: ta.count,
      avgScore: ta.count > 0 ? Math.round((ta.totalScore / ta.count) * 10) / 10 : 0,
    }));

    const periods = ["Q1", "Q2", "Q3", "Q4", "ANNUAL"];
    const quarterlyTrend = periods.map((period) => {
      const periodCheckins = allCheckins.filter((c) => c.period === period);
      const avg = periodCheckins.length > 0
        ? periodCheckins.reduce((sum, c) => sum + (c.progressScore ?? 0), 0) / periodCheckins.length
        : 0;
      return { period, avgScore: Math.round(avg * 10) / 10, count: periodCheckins.length };
    });

    const totalEmployees = users.length;
    const checkinCompletion = periods.map((period) => {
      const completed = users.filter((u) =>
        u.goals.some((g) => g.checkins.some((c) => c.period === period && c.completedAt))
      ).length;
      return {
        period,
        completed,
        total: totalEmployees,
        rate: totalEmployees > 0 ? Math.round((completed / totalEmployees) * 100) : 0,
      };
    });

    const statusDist = ["NOT_STARTED", "ON_TRACK", "COMPLETED", "AT_RISK"].map((status) => ({
      status,
      count: allCheckins.filter((c) => c.progressStatus === status).length,
    }));

    const avgOrgScore = userSummaries.length > 0
      ? Math.round((userSummaries.reduce((s, u) => s + u.avgScore, 0) / userSummaries.length) * 10) / 10
      : 0;

    return NextResponse.json({
      userSummaries,
      thrustAreaBreakdown,
      quarterlyTrend,
      checkinCompletion,
      statusDistribution: statusDist,
      totals: {
        employees: totalEmployees,
        goals: allGoals.length,
        lockedGoals: allGoals.filter((g) => g.status === "LOCKED").length,
        avgOrgScore,
      },
    });

  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Analytics failed", details: error.message }, { status: 500 });
  }
}
