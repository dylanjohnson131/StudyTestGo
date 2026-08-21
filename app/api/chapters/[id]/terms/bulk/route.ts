import { NextRequest, NextResponse } from "next/server";
import { addTerms } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const rawEntries = Array.isArray(body?.entries) ? body.entries : [];

  const entries = rawEntries
    .filter(
      (e: unknown): e is { term: string; definition: string } =>
        typeof (e as { term?: unknown })?.term === "string" &&
        typeof (e as { definition?: unknown })?.definition === "string" &&
        (e as { term: string }).term.trim().length > 0 &&
        (e as { definition: string }).definition.trim().length > 0
    )
    .map((e: { term: string; definition: string }) => ({ term: e.term, definition: e.definition }));

  if (entries.length === 0) {
    return NextResponse.json({ error: "entries must contain at least one valid term/definition pair" }, { status: 400 });
  }

  const created = await addTerms(id, entries);
  if (!created) return NextResponse.json({ error: "chapter not found" }, { status: 404 });
  return NextResponse.json(created, { status: 201 });
}
