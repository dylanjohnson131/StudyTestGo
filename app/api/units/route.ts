import { NextRequest, NextResponse } from "next/server";
import { createUnit, listUnitSummaries } from "@/lib/store";

export async function GET() {
  const units = await listUnitSummaries();
  return NextResponse.json(units);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const chapterIds: string[] = Array.isArray(body?.chapterIds)
    ? body.chapterIds.filter((v: unknown) => typeof v === "string")
    : [];
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const unit = await createUnit(name, chapterIds);
  return NextResponse.json(unit, { status: 201 });
}
