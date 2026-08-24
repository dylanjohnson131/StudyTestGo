import { NextRequest, NextResponse } from "next/server";
import { createUnit, listUnitSummaries } from "@/lib/store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
  const units = await listUnitSummaries(classId);
  return NextResponse.json(units);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const classId = typeof body?.classId === "string" ? body.classId.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const chapterIds: string[] = Array.isArray(body?.chapterIds)
    ? body.chapterIds.filter((v: unknown) => typeof v === "string")
    : [];
  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const unit = await createUnit(classId, name, chapterIds);
  return NextResponse.json(unit, { status: 201 });
}
