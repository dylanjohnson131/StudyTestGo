import { NextRequest, NextResponse } from "next/server";
import { createClass, listClassSummaries } from "@/lib/store";

export async function GET() {
  const classes = await listClassSummaries();
  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const cls = await createClass(name);
  return NextResponse.json(cls, { status: 201 });
}
