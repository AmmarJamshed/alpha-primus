import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function ProviderClaimCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="group overflow-hidden rounded-3xl bg-gradient-to-br from-[#A8C5A0]/20 via-white to-[#B8D4E8]/20 p-8 transition-all duration-500 hover:shadow-xl sm:p-12 lg:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
                Are you a provider?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Claim your profile, update your information, and connect with people
                actively seeking support in your area.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full bg-[#0B1F3A] px-8 transition-transform hover:scale-105 hover:bg-[#0B1F3A]/90 active:scale-95"
              >
                <Link href="/providers/claim">
                  Claim Your Profile
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
