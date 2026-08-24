import { NextRequest, NextResponse } from "next/server";
import { createChapter, listChapters } from "@/lib/store";

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
  const chapters = await listChapters(classId);
  return NextResponse.json(chapters);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const classId = typeof body?.classId === "string" ? body.classId.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const chapter = await createChapter(classId, name);
  return NextResponse.json(chapter, { status: 201 });
}
