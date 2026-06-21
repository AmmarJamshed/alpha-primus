import { NextResponse } from "next/server";
import { insertWellnessCheckin } from "@/lib/activity/server";

export async function POST(request: Request) {
  let body: {
    mood_score?: number;
    stress_level?: number;
    challenges?: string[];
    notes?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mood = body.mood_score;
  const stress = body.stress_level;

  if (
    typeof mood !== "number" ||
    typeof stress !== "number" ||
    mood < 1 ||
    mood > 5 ||
    stress < 1 ||
    stress > 5
  ) {
    return NextResponse.json(
      { error: "mood_score and stress_level must be 1-5" },
      { status: 400 },
    );
  }

  const result = await insertWellnessCheckin(request, {
    mood_score: mood,
    stress_level: stress,
    challenges: body.challenges,
    notes: body.notes,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
