import { NextRequest, NextResponse } from "next/server";
import { addChapterTestAttempt, listChapterTestAttempts } from "@/lib/store";
import type { TermResult } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const attempts = await listChapterTestAttempts(id);
  if (!attempts) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(attempts);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const score = Number(body?.score);
  const total = Number(body?.total);
  const termResults: TermResult[] = Array.isArray(body?.termResults) ? body.termResults : [];
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: "score and total are required" }, { status: 400 });
  }
  const attempt = await addChapterTestAttempt(id, score, total, termResults);
  if (!attempt) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(attempt, { status: 201 });
}
