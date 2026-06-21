import { Sparkles } from "lucide-react";
import { AiGuidePanel } from "@/components/ai/ai-guide-panel";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "AI Wellness Guide",
  description:
    "Personalized therapist, retreat, and event recommendations based on your activity and wellness check-ins.",
  path: "/guide",
});

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
          <Sparkles className="h-7 w-7 text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
          Your AI wellness guide
        </h1>
        <p className="mt-4 text-muted-foreground">
          Alpha Primus tracks what you explore (searches, providers, retreats) and
          combines it with your check-ins to suggest your next best steps. Sign in
          to sync across devices — or use anonymously with this browser session.
        </p>
      </div>

      <div className="mt-12">
        <AiGuidePanel />
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        AI guidance is informational only. Alpha Primus is not a healthcare
        provider. In crisis, call or text 988 (US).
      </p>
    </div>
  );
}
