"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Heart,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityHeaders } from "@/lib/activity/client";
import type { AiRecommendationResult, SupportLevel } from "@/lib/activity/types";
import { cn } from "@/lib/utils";
import { WellnessCheckinForm } from "@/components/ai/wellness-checkin-form";

const SUPPORT_STYLES: Record<
  SupportLevel,
  { label: string; className: string; icon: typeof Heart }
> = {
  thriving: {
    label: "Thriving",
    className: "bg-[#A8C5A0]/20 text-[#2d5a3d] border-[#A8C5A0]/40",
    icon: TrendingUp,
  },
  steady: {
    label: "Steady progress",
    className: "bg-[#B8D4E8]/30 text-[#0B1F3A] border-[#B8D4E8]/50",
    icon: Sparkles,
  },
  needs_support: {
    label: "Extra support recommended",
    className: "bg-[#D4AF37]/15 text-[#5c4a00] border-[#D4AF37]/40",
    icon: Heart,
  },
  check_in_recommended: {
    label: "Reach out for support",
    className: "bg-red-50 text-red-900 border-red-200",
    icon: AlertCircle,
  },
};

export function AiGuidePanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiRecommendationResult | null>(null);
  const [activitySummary, setActivitySummary] = useState<{
    positive_signals: string[];
    concern_signals: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckin, setLastCheckin] = useState<{
    mood_score: number;
    stress_level: number;
    challenges: string[];
    notes?: string;
  } | null>(null);

  async function generateRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: activityHeaders(),
        body: JSON.stringify({ checkin: lastCheckin }),
      });

      let data: { error?: string } & Partial<AiRecommendationResult> = {};
      const text = await res.text();
      try {
        data = text ? (JSON.parse(text) as typeof data) : {};
      } catch {
        setError(
          res.ok
            ? "Invalid response from server"
            : `Server error (${res.status}). Check that GROQ_API_KEY and Supabase are configured in Vercel.`,
        );
        return;
      }

      if (!res.ok) {
        setError(data.error ?? `Could not generate recommendations (${res.status})`);
        return;
      }
      setResult(data as AiRecommendationResult);
      setActivitySummary(
        (data as { activity_summary?: typeof activitySummary }).activity_summary ?? null,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const support = result ? SUPPORT_STYLES[result.support_level] : null;
  const SupportIcon = support?.icon ?? Sparkles;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3A]">
            <Heart className="h-5 w-5 text-[#D4AF37]" />
            Wellness check-in
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Share how you&apos;re doing so our AI guide can tailor suggestions.
            This is not a diagnosis — just guidance based on your activity.
          </p>
        </CardHeader>
        <CardContent>
          <WellnessCheckinForm
            onSaved={setLastCheckin}
            onValuesChange={setLastCheckin}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3A]">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              AI wellness guide
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We analyze your browsing (therapists viewed, searches, retreats) plus
              your check-in to suggest your next best steps.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              onClick={generateRecommendations}
              disabled={loading}
              className="w-full rounded-full bg-[#0B1F3A]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Get personalized recommendations
            </Button>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
          </CardContent>
        </Card>

        {result && support && (
          <Card className="border-border/60">
            <CardContent className="space-y-5 p-6">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
                  support.className,
                )}
              >
                <SupportIcon className="h-4 w-4" />
                {support.label}
              </div>

              <div>
                <h3 className="font-semibold text-[#0B1F3A]">Your progress</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {result.progress_summary}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-[#0B1F3A]">
                {result.encouragement}
              </p>

              {activitySummary && activitySummary.concern_signals.length > 0 && (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-medium">We noticed</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {activitySummary.concern_signals.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-[#0B1F3A]">Recommended for you</h3>
                <ul className="mt-3 space-y-3">
                  {result.recommendations.map((rec, i) => {
                    const href =
                      rec.href ??
                      (rec.slug && rec.type === "provider"
                        ? `/providers/${rec.slug}`
                        : rec.slug && rec.type === "retreat"
                          ? `/retreats/${rec.slug}`
                          : rec.slug && rec.type === "event"
                            ? `/events/${rec.slug}`
                            : undefined);

                    return (
                      <li
                        key={`${rec.title}-${i}`}
                        className="rounded-xl border border-border/60 p-4 transition-colors hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5"
                      >
                        <p className="font-medium text-[#0B1F3A]">{rec.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {rec.reason}
                        </p>
                        {href && (
                          <Link
                            href={href}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37]"
                          >
                            View option
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {result.wellness_tip && (
                <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  <span className="font-medium text-[#0B1F3A]">Tip: </span>
                  {result.wellness_tip}
                </p>
              )}

              {result.support_level === "check_in_recommended" && (
                <p className="text-xs text-muted-foreground">
                  If you are in crisis, call or text <strong>988</strong> (US) or
                  contact emergency services.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
