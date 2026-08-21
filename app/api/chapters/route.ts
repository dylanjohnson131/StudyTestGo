import { NextRequest, NextResponse } from "next/server";
import { createChapter, listChapters } from "@/lib/store";

export async function GET() {
  const chapters = await listChapters();
  return NextResponse.json(chapters);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const chapter = await createChapter(name);
  return NextResponse.json(chapter, { status: 201 });
}
