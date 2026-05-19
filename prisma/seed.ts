import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Thrust Areas ───────────────────────────────────────────────────────────
  const thrustAreas = await Promise.all([
    prisma.thrustArea.upsert({ where: { name: "Revenue & Growth" }, update: {}, create: { name: "Revenue & Growth", description: "Sales, revenue targets, and business growth" } }),
    prisma.thrustArea.upsert({ where: { name: "Customer Success" }, update: {}, create: { name: "Customer Success", description: "Customer satisfaction, retention, and NPS" } }),
    prisma.thrustArea.upsert({ where: { name: "Operational Excellence" }, update: {}, create: { name: "Operational Excellence", description: "Process efficiency, TAT, and cost optimization" } }),
    prisma.thrustArea.upsert({ where: { name: "People & Culture" }, update: {}, create: { name: "People & Culture", description: "Team development, training, and engagement" } }),
    prisma.thrustArea.upsert({ where: { name: "Safety & Compliance" }, update: {}, create: { name: "Safety & Compliance", description: "Zero incidents, regulatory compliance" } }),
    prisma.thrustArea.upsert({ where: { name: "Innovation & Technology" }, update: {}, create: { name: "Innovation & Technology", description: "Digital transformation and innovation initiatives" } }),
  ]);

  console.log("✅ Thrust areas created");

  // ── Active Cycle ───────────────────────────────────────────────────────────
  const cycle = await prisma.cycle.upsert({
    where: { id: "cycle-fy2526" },
    update: {},
    create: {
      id: "cycle-fy2526",
      name: "FY 2025-26",
      phase: "GOAL_SETTING",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),
      isActive: true,
    },
  });

  console.log("✅ Cycle created");

  // ── Users ──────────────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com", name: "Priya Sharma", role: "ADMIN",
      passwordHash: hash("demo123"), department: "HR", designation: "HR Manager",
      employeeId: "EMP001",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      email: "manager@demo.com", name: "Arjun Mehta", role: "MANAGER",
      passwordHash: hash("demo123"), department: "Sales", designation: "Sales Manager",
      employeeId: "EMP002",
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@demo.com" },
    update: {},
    create: {
      email: "employee@demo.com", name: "Rahul Verma", role: "EMPLOYEE",
      passwordHash: hash("demo123"), department: "Sales", designation: "Sales Executive",
      employeeId: "EMP003", managerId: manager.id,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: "employee2@demo.com" },
    update: {},
    create: {
      email: "employee2@demo.com", name: "Sneha Iyer", role: "EMPLOYEE",
      passwordHash: hash("demo123"), department: "Sales", designation: "Sales Executive",
      employeeId: "EMP004", managerId: manager.id,
    },
  });

  console.log("✅ Users created");

  // ── Sample Goals for employee ──────────────────────────────────────────────
  const existing = await prisma.goal.findFirst({ where: { ownerId: employee.id } });
  if (!existing) {
    const g1 = await prisma.goal.create({
      data: {
        title: "Achieve Q3 Sales Revenue Target",
        description: "Drive sales revenue to ₹50L through new client acquisition and upselling",
        thrustAreaId: thrustAreas[0].id,
        uomType: "MIN", uomUnit: "₹ Lakhs", target: 50,
        weightage: 40, cycleId: cycle.id, ownerId: employee.id,
        status: "LOCKED", approverId: manager.id,
        approvedAt: new Date(), lockedAt: new Date(),
        aiQualityScore: 82,
      },
    });

    const g2 = await prisma.goal.create({
      data: {
        title: "Improve Customer NPS Score",
        description: "Achieve Net Promoter Score of 70+ through proactive follow-ups",
        thrustAreaId: thrustAreas[1].id,
        uomType: "MIN", uomUnit: "Score", target: 70,
        weightage: 30, cycleId: cycle.id, ownerId: employee.id,
        status: "LOCKED", approverId: manager.id,
        approvedAt: new Date(), lockedAt: new Date(),
        aiQualityScore: 76,
      },
    });

    const g3 = await prisma.goal.create({
      data: {
        title: "Reduce Customer Complaint TAT",
        description: "Resolve all customer complaints within 24 hours",
        thrustAreaId: thrustAreas[2].id,
        uomType: "MAX", uomUnit: "Hours", target: 24,
        weightage: 20, cycleId: cycle.id, ownerId: employee.id,
        status: "SUBMITTED",
        aiQualityScore: 68,
      },
    });

    const g4 = await prisma.goal.create({
      data: {
        title: "Zero Safety Incidents",
        description: "Maintain zero workplace safety incidents throughout FY",
        thrustAreaId: thrustAreas[4].id,
        uomType: "ZERO",
        weightage: 10, cycleId: cycle.id, ownerId: employee.id,
        status: "DRAFT",
      },
    });

    // Sample check-ins for locked goals
    await prisma.checkin.createMany({
      data: [
        { goalId: g1.id, employeeId: employee.id, cycleId: cycle.id, period: "Q1", plannedTarget: 12, actualAchievement: 14, progressStatus: "COMPLETED", progressScore: 100, employeeNote: "Exceeded Q1 target through 3 new client acquisitions", completedAt: new Date() },
        { goalId: g1.id, employeeId: employee.id, cycleId: cycle.id, period: "Q2", plannedTarget: 12, actualAchievement: 10, progressStatus: "AT_RISK", progressScore: 83.3, employeeNote: "Slightly below target — pipeline looks strong for Q3", completedAt: new Date() },
        { goalId: g2.id, employeeId: employee.id, cycleId: cycle.id, period: "Q1", plannedTarget: 65, actualAchievement: 68, progressStatus: "ON_TRACK", progressScore: 97.1, completedAt: new Date() },
      ],
    });

    console.log("✅ Sample goals and check-ins created");
  }

  console.log("🎉 Seed complete! Demo accounts:");
  console.log("   Employee: employee@demo.com / demo123");
  console.log("   Manager:  manager@demo.com / demo123");
  console.log("   Admin:    admin@demo.com / demo123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
