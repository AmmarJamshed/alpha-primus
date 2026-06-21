import { NextResponse } from "next/server";
import { insertActivityEvent } from "@/lib/activity/server";
import type { ActivityEventInput } from "@/lib/activity/types";

export async function POST(request: Request) {
  let body: ActivityEventInput;
  try {
    body = (await request.json()) as ActivityEventInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.event_type) {
    return NextResponse.json({ error: "event_type required" }, { status: 400 });
  }

  const result = await insertActivityEvent(request, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
