import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cycles = await prisma.cycle.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cycles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, startDate, endDate } = await req.json();

  // Deactivate other cycles first
  await prisma.cycle.updateMany({ data: { isActive: false } });

  const cycle = await prisma.cycle.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive: true },
  });
  return NextResponse.json(cycle, { status: 201 });
}
