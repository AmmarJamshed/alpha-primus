import type {
  ActivityEventRow,
  AiRecommendationResult,
  WellnessCheckinRow,
} from "@/lib/activity/types";
import {
  analyzeActivity,
  buildCatalogContext,
  type ActivityInsights,
} from "@/lib/activity/insights";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY ?? null;
}

function fallbackRecommendations(
  insights: ActivityInsights,
  catalog: ReturnType<typeof buildCatalogContext>["catalog"],
): AiRecommendationResult {
  const needsSupport = insights.concernSignals.length > 0;

  const recommendations = catalog.slice(0, 5).map((item) => ({
    type: item.type,
    title: item.title,
    reason: needsSupport
      ? "May align with your recent browsing and current wellness needs."
      : "Matches your recent exploration on Alpha Primus.",
    slug: item.slug,
    href:
      item.type === "provider"
        ? `/providers/${item.slug}`
        : item.type === "retreat"
          ? `/retreats/${item.slug}`
          : `/events/${item.slug}`,
    category: item.category,
  }));

  return {
    support_level: needsSupport ? "needs_support" : "steady",
    progress_summary: insights.positiveSignals.length
      ? insights.positiveSignals.join(". ")
      : "You are beginning to explore support options on Alpha Primus.",
    encouragement: needsSupport
      ? "Reaching out for support is a meaningful step. You do not have to navigate this alone."
      : "Keep exploring — small consistent steps forward add up.",
    wellness_tip: "Try saving one provider or event that resonates, then follow up this week.",
    recommendations,
  };
}

export async function generateAiRecommendations(
  activity: ActivityEventRow[],
  checkin: WellnessCheckinRow | null,
): Promise<{ result: AiRecommendationResult; model: string }> {
  const insights = analyzeActivity(activity, checkin);
  const { topState, topCategories, catalog } = buildCatalogContext(insights);

  const apiKey = getGroqKey();
  if (!apiKey) {
    return {
      result: fallbackRecommendations(insights, catalog),
      model: "fallback-local",
    };
  }

  const systemPrompt = `You are a compassionate wellness guide for Alpha Primus, a US discovery platform for therapists, coaches, retreats, events, and support groups.
You are NOT a therapist and do NOT diagnose. Recommend appropriate next steps from the catalog only.
If concern signals suggest crisis (self-harm, danger), set support_level to "check_in_recommended" and recommend professional help + crisis resources.
Return ONLY valid JSON matching this schema:
{
  "support_level": "thriving" | "steady" | "needs_support" | "check_in_recommended",
  "progress_summary": "string — acknowledge positive steps from activity",
  "encouragement": "string — warm, brief",
  "wellness_tip": "string — one practical tip",
  "recommendations": [
    {
      "type": "provider" | "retreat" | "event" | "category" | "action",
      "title": "string",
      "reason": "string — why this fits their activity/mood",
      "slug": "optional slug from catalog",
      "href": "optional path like /search?category=Therapists",
      "category": "optional"
    }
  ]
}
Pick 3-5 recommendations. Prefer catalog items. For tough conditions suggest therapists or support groups; for growth suggest coaches or events; for burnout suggest retreats or burnout programs.`;

  const userPrompt = JSON.stringify(
    {
      activity_insights: insights,
      latest_checkin: checkin,
      preferred_state: topState,
      top_categories: topCategories,
      catalog,
    },
    null,
    2,
  );

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Groq API error:", res.status, text.slice(0, 300));
      return {
        result: fallbackRecommendations(insights, catalog),
        model: "fallback-local",
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        result: fallbackRecommendations(insights, catalog),
        model: "fallback-local",
      };
    }

    const parsed = JSON.parse(content) as AiRecommendationResult;
    return {
      result: {
        support_level: parsed.support_level ?? "steady",
        progress_summary: parsed.progress_summary ?? "",
        encouragement: parsed.encouragement ?? "",
        wellness_tip: parsed.wellness_tip ?? "",
        recommendations: (parsed.recommendations ?? []).slice(0, 6),
      },
      model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
    };
  } catch (err) {
    console.error("Groq recommendation failed:", err);
    return {
      result: fallbackRecommendations(insights, catalog),
      model: "fallback-local",
    };
  }
}
