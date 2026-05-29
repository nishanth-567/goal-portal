import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateGoalSheet } from "@/lib/scoring";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: {
        thrustArea: true,
        owner: { select: { id: true, name: true, email: true, department: true } },
        approver: { select: { id: true, name: true, email: true } },
        checkins: { orderBy: { period: "asc" } },
        auditLogs: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const canView =
      goal.ownerId === session.user.id ||
      goal.approverId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "MANAGER";

    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error("GET goal error:", error);
    return NextResponse.json({ error: "Failed to fetch goal", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goal = await prisma.goal.findUnique({ where: { id: params.id } });
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const { action, ...updateData } = body;
    const now = new Date();

    if (action === "submit") {
      if (goal.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (goal.status !== "DRAFT" && goal.status !== "RETURNED") {
        return NextResponse.json({ error: "Goal is not in draft/returned state." }, { status: 400 });
      }

      const allGoals = await prisma.goal.findMany({
        where: { ownerId: session.user.id, cycleId: goal.cycleId, status: { not: "RETURNED" } },
        select: { weightage: true, id: true },
      });

      const sheet = allGoals.map((g) => ({
        weightage: g.id === goal.id ? (updateData.weightage ?? goal.weightage) : g.weightage,
      }));

      const validation = validateGoalSheet(sheet);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
      }

      const updated = await prisma.goal.update({
        where: { id: params.id },
        data: { status: "SUBMITTED", submittedAt: now, updatedAt: now },
      });

      await prisma.auditLog.create({
        data: { id: randomUUID(), goalId: goal.id, userId: session.user.id, action: "SUBMITTED", createdAt: now },
      });

      return NextResponse.json(updated);
    }

    if (action === "approve") {
      if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only managers can approve." }, { status: 403 });
      }

      const updated = await prisma.goal.update({
        where: { id: params.id },
        data: {
          status: "LOCKED",
          approverId: session.user.id,
          approvedAt: now,
          lockedAt: now,
          updatedAt: now,
          managerComment: updateData.managerComment,
          ...(updateData.target !== undefined && { target: updateData.target }),
          ...(updateData.weightage !== undefined && { weightage: updateData.weightage }),
        },
      });

      await prisma.auditLog.create({
        data: { id: randomUUID(), goalId: goal.id, userId: session.user.id, action: "APPROVED", note: updateData.managerComment, createdAt: now },
      });

      return NextResponse.json(updated);
    }

    if (action === "return") {
      if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only managers can return goals." }, { status: 403 });
      }

      const updated = await prisma.goal.update({
        where: { id: params.id },
        data: { status: "RETURNED", approverId: session.user.id, managerComment: updateData.managerComment, updatedAt: now },
      });

      await prisma.auditLog.create({
        data: { id: randomUUID(), goalId: goal.id, userId: session.user.id, action: "RETURNED", note: updateData.managerComment, createdAt: now },
      });

      return NextResponse.json(updated);
    }

    if (action === "unlock") {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only admins can unlock goals." }, { status: 403 });
      }

      const updated = await prisma.goal.update({
        where: { id: params.id },
        data: { status: "APPROVED", lockedAt: null, updatedAt: now },
      });

      await prisma.auditLog.create({
        data: { id: randomUUID(), goalId: goal.id, userId: session.user.id, action: "UNLOCKED", createdAt: now },
      });

      return NextResponse.json(updated);
    }

    if (goal.status === "LOCKED" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Goal is locked. Contact admin to unlock." }, { status: 403 });
    }

    if (goal.ownerId !== session.user.id && session.user.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedFields = ["title", "description", "target", "targetDate", "weightage", "uomUnit", "aiQualityScore", "aiSuggestions"];
    const sanitized: Record<string, any> = { updatedAt: now };
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) sanitized[key] = updateData[key];
    }

    const previous = { ...goal };
    const updated = await prisma.goal.update({ where: { id: params.id }, data: sanitized });

    for (const key of Object.keys(sanitized)) {
      if (key === "updatedAt" || key === "aiQualityScore" || key === "aiSuggestions") continue;
      if ((previous as any)[key] !== sanitized[key]) {
        await prisma.auditLog.create({
          data: {
            id: randomUUID(),
            goalId: goal.id,
            userId: session.user.id,
            action: "UPDATED",
            field: key,
            oldValue: String((previous as any)[key] ?? ""),
            newValue: String(sanitized[key] ?? ""),
            createdAt: now,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH goal error:", error);
    return NextResponse.json({ error: "Failed to update goal", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goal = await prisma.goal.findUnique({ where: { id: params.id } });
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (goal.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (goal.status === "LOCKED" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Cannot delete a locked goal." }, { status: 403 });
    }

    await prisma.goal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE goal error:", error);
    return NextResponse.json({ error: "Failed to delete goal", details: error.message }, { status: 500 });
  }
}
