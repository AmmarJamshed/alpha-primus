import { NextResponse } from "next/server";
import {
  fetchActivityContext,
  saveAiRecommendation,
} from "@/lib/activity/server";
import { analyzeActivity } from "@/lib/activity/insights";
import { generateAiRecommendations } from "@/lib/groq/recommendations";

export async function POST(request: Request) {
  const { activity, checkin } = await fetchActivityContext(request);

  const { result, model } = await generateAiRecommendations(activity, checkin);

  await saveAiRecommendation(request, {
    support_level: result.support_level,
    progress_summary: result.progress_summary,
    encouragement: result.encouragement,
    wellness_tip: result.wellness_tip,
    recommendations: result.recommendations,
    model,
  });

  const insights = analyzeActivity(activity, checkin);

  return NextResponse.json({
    ...result,
    model,
    activity_summary: {
      total_events: insights.totalEvents,
      positive_signals: insights.positiveSignals,
      concern_signals: insights.concernSignals,
    },
  });
}

export async function GET(request: Request) {
  const { activity, checkin } = await fetchActivityContext(request);
  const insights = analyzeActivity(activity, checkin);

  return NextResponse.json({
    activity_count: insights.totalEvents,
    latest_checkin: checkin,
    positive_signals: insights.positiveSignals,
    concern_signals: insights.concernSignals,
    top_categories: insights.categoryCounts,
  });
}
