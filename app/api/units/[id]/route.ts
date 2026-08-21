import { NextRequest, NextResponse } from "next/server";
import { deleteUnit, getUnit, getUnitChapters, updateUnit } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) return NextResponse.json({ error: "not found" }, { status: 404 });
  const chapters = await getUnitChapters(unit);
  const terms = chapters.flatMap((c) => c.terms);
  return NextResponse.json({
    ...unit,
    chapters: chapters.map((c) => ({ id: c.id, name: c.name, termCount: c.terms.length })),
    terms,
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const updates: { name?: string; chapterIds?: string[] } = {};
  if (typeof body?.name === "string") updates.name = body.name;
  if (Array.isArray(body?.chapterIds)) {
    updates.chapterIds = body.chapterIds.filter((v: unknown) => typeof v === "string");
  }
  if (updates.name === undefined && updates.chapterIds === undefined) {
    return NextResponse.json({ error: "name or chapterIds is required" }, { status: 400 });
  }
  const unit = await updateUnit(id, updates);
  if (!unit) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(unit);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await deleteUnit(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
