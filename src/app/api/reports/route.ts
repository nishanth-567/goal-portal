import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cycleId = searchParams.get("cycleId");
  const format = searchParams.get("format") || "json";

  const goals = await prisma.goal.findMany({
    where: { ...(cycleId ? { cycleId } : {}), status: "LOCKED" },
    include: {
      owner: { select: { name: true, email: true, department: true, employeeId: true } },
      thrustArea: true,
      checkins: { orderBy: { period: "asc" } },
      approver: { select: { name: true } },
    },
    orderBy: [{ owner: { name: "asc" } }, { thrustArea: { name: "asc" } }],
  });

  if (format === "csv") {
    const rows: string[] = [
      "Employee ID,Employee Name,Department,Manager,Thrust Area,Goal Title,UoM Type,Target,Weightage,Q1 Planned,Q1 Actual,Q1 Score,Q2 Planned,Q2 Actual,Q2 Score,Q3 Planned,Q3 Actual,Q3 Score,Q4 Planned,Q4 Actual,Q4 Score,Final Status",
    ];

    for (const goal of goals) {
      const getCheckin = (period: string) =>
        goal.checkins.find((c) => c.period === period);

      const q1 = getCheckin("Q1");
      const q2 = getCheckin("Q2");
      const q3 = getCheckin("Q3");
      const q4 = getCheckin("Q4");

      rows.push(
        [
          goal.owner.employeeId || "",
          goal.owner.name,
          goal.owner.department || "",
          goal.approver?.name || "",
          goal.thrustArea.name,
          `"${goal.title.replace(/"/g, '""')}"`,
          goal.uomType,
          goal.target ?? "",
          goal.weightage,
          q1?.plannedTarget ?? "", q1?.actualAchievement ?? "", q1?.progressScore?.toFixed(1) ?? "",
          q2?.plannedTarget ?? "", q2?.actualAchievement ?? "", q2?.progressScore?.toFixed(1) ?? "",
          q3?.plannedTarget ?? "", q3?.actualAchievement ?? "", q3?.progressScore?.toFixed(1) ?? "",
          q4?.plannedTarget ?? "", q4?.actualAchievement ?? "", q4?.progressScore?.toFixed(1) ?? "",
          goal.checkins[goal.checkins.length - 1]?.progressStatus || "NOT_STARTED",
        ].join(",")
      );
    }

    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="achievement-report-${cycleId || "all"}.csv"`,
      },
    });
  }

  return NextResponse.json(goals);
}
