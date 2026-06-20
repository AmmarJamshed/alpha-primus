import Link from "next/link";
import { Heart, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My Dashboard",
  path: "/dashboard",
});

const sections = [
  {
    title: "Saved Providers",
    description: "Providers you've bookmarked for later.",
    icon: Heart,
    href: "/search",
  },
  {
    title: "Saved Events",
    description: "Events you're interested in attending.",
    icon: Star,
    href: "/events",
  },
  {
    title: "Profile Settings",
    description: "Update your name, email, and preferences.",
    icon: Settings,
    href: "/auth/login",
  },
];

export default function UserDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A]">My Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Track your saved providers, events, and reviews.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-[#D4AF37]" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-[#0B1F3A]">
                <Link href={section.href}>View →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Sign in to sync your saved items across devices via your Supabase account.
      </p>
    </div>
  );
}
