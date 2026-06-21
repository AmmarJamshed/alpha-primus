"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { activityHeaders } from "@/lib/activity/client";
import { WELLNESS_CHALLENGES } from "@/lib/activity/types";
import { cn } from "@/lib/utils";

interface WellnessCheckinFormProps {
  onComplete?: () => void;
}

export function WellnessCheckinForm({ onComplete }: WellnessCheckinFormProps) {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleChallenge(id: string) {
    setChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/wellness-checkin", {
        method: "POST",
        headers: activityHeaders(),
        body: JSON.stringify({
          mood_score: mood,
          stress_level: stress,
          challenges,
          notes: notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSaved(true);
        onComplete?.();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold text-[#0B1F3A]">
          How is your mood today? ({mood}/5)
        </Label>
        <input
          type="range"
          min={1}
          max={5}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="mt-3 w-full accent-[#D4AF37]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Great</span>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-[#0B1F3A]">
          Stress level ({stress}/5)
        </Label>
        <input
          type="range"
          min={1}
          max={5}
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
          className="mt-3 w-full accent-[#0B1F3A]"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Calm</span>
          <span>Overwhelmed</span>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-[#0B1F3A]">
          What feels hardest right now? (optional)
        </Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {WELLNESS_CHALLENGES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleChallenge(c.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-all",
                challenges.includes(c.id)
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#0B1F3A]"
                  : "border-border hover:border-[#D4AF37]/40",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="wellness-notes">Anything else to share? (optional)</Label>
        <Textarea
          id="wellness-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="A few words about how you've been feeling…"
          className="mt-2 min-h-[80px]"
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-[#0B1F3A]"
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Save check-in
      </Button>

      {saved && (
        <p className="text-center text-sm text-[#D4AF37]">
          Check-in saved. Generate recommendations below.
        </p>
      )}
    </form>
  );
}
