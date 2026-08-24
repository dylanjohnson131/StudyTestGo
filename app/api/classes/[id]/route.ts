import { NextRequest, NextResponse } from "next/server";
import { deleteClass, getClass, renameClass } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const cls = await getClass(id);
  if (!cls) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(cls);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const cls = await renameClass(id, name);
  if (!cls) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(cls);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = await deleteClass(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
