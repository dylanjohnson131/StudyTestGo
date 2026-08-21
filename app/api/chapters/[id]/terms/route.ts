import { NextRequest, NextResponse } from "next/server";
import { addTerm } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const term = typeof body?.term === "string" ? body.term.trim() : "";
  const definition = typeof body?.definition === "string" ? body.definition.trim() : "";
  if (!term || !definition) {
    return NextResponse.json({ error: "term and definition are required" }, { status: 400 });
  }
  const created = await addTerm(id, term, definition);
  if (!created) return NextResponse.json({ error: "chapter not found" }, { status: 404 });
  return NextResponse.json(created, { status: 201 });
}
