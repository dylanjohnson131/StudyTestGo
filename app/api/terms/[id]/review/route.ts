import { NextRequest, NextResponse } from "next/server";
import { reviewTerm } from "@/lib/store";
import type { Mastery } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const VALID_RESULTS: Mastery[] = ["learning", "known"];

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = body?.result as Mastery | undefined;
  if (!result || !VALID_RESULTS.includes(result)) {
    return NextResponse.json({ error: "result must be 'learning' or 'known'" }, { status: 400 });
  }
  const term = await reviewTerm(id, result);
  if (!term) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(term);
}
