import { NextRequest, NextResponse } from "next/server";
import { deleteChapter, getChapter, renameChapter } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const chapter = await getChapter(id);
  if (!chapter) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(chapter);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const chapter = await renameChapter(id, name);
  if (!chapter) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(chapter);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await deleteChapter(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
