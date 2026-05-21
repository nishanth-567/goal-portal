import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  // Employees can only see their own manager
  if (session.user.role === "EMPLOYEE") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(me ? [me.manager].filter(Boolean) : []);
  }

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      ...(role ? { role: role as any } : {}),
    },
    select: {
      id: true, name: true, email: true, role: true,
      department: true, designation: true, employeeId: true,
      manager: { select: { id: true, name: true } },
      _count: { select: { directReports: true, goals: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role, department, designation, employeeId, managerId } = await req.json();
  if (!password || password.length < 8) {
  return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
}

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password || "Welcome@123", 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, department, designation, employeeId, managerId },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}
