import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const hash = await bcrypt.hash("demo123", 10);
  const check = await bcrypt.compare("demo123", hash);
  return NextResponse.json({ hash, check });
}
