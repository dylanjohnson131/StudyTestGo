import { NextRequest, NextResponse } from "next/server";
import { deleteTerm, updateTerm } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const updates: { term?: string; definition?: string } = {};
  if (typeof body?.term === "string") updates.term = body.term;
  if (typeof body?.definition === "string") updates.definition = body.definition;
  if (updates.term === undefined && updates.definition === undefined) {
    return NextResponse.json({ error: "term or definition is required" }, { status: 400 });
  }
  const term = await updateTerm(id, updates);
  if (!term) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(term);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await deleteTerm(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
