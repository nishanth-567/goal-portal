import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/shared/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;
  const role = session.user.role;

  let cycle = null;
  let myGoals: any[] = [];
  let teamStats = null;

  try {
    cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

    myGoals = cycle
      ? await prisma.goal.findMany({
          where: { ownerId: userId, cycleId: cycle.id },
          include: { thrustArea: true, checkins: true },
        })
      : [];

    if (role === "MANAGER" || role === "ADMIN") {
      const teamFilter = role === "MANAGER" ? { managerId: userId } : {};
      const teamUsers = await prisma.user.findMany({
        where: { ...teamFilter, isActive: true, role: "EMPLOYEE" },
        select: { id: true, name: true },
      });
      const teamGoals = cycle
        ? await prisma.goal.findMany({
            where: {
              ownerId: { in: teamUsers.map((u) => u.id) },
              cycleId: cycle.id,
            },
            include: { checkins: true },
          })
        : [];

      teamStats = {
        teamSize: teamUsers.length,
        totalGoals: teamGoals.length,
        lockedGoals: teamGoals.filter((g) => g.status === "LOCKED").length,
        pendingApproval: teamGoals.filter((g) => g.status === "SUBMITTED").length,
        atRisk: teamGoals.filter((g) =>
          g.checkins.some((c) => c.progressStatus === "AT_RISK")
        ).length,
      };
    }
  } catch (error) {
    console.error("Dashboard error:", error);
  }

  const stats = {
    totalGoals: myGoals.length,
    lockedGoals: myGoals.filter((g) => g.status === "LOCKED").length,
    draftGoals: myGoals.filter((g) => g.status === "DRAFT").length,
    submittedGoals: myGoals.filter((g) => g.status === "SUBMITTED").length,
    returnedGoals: myGoals.filter((g) => g.status === "RETURNED").length,
    totalWeightage: myGoals.reduce((s, g) => s + g.weightage, 0),
    completedCheckins: myGoals.filter((g) =>
      g.checkins.some((c: any) => c.progressStatus === "COMPLETED")
    ).length,
  };

  return (
    <DashboardClient
      session={session}
      stats={stats}
      teamStats={teamStats}
      cycle={cycle}
      recentGoals={myGoals.slice(0, 5)}
    />
  );
}
