import Link from "next/link";
import { BarChart3, Image, Link2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Provider Dashboard",
  path: "/provider-dashboard",
});

const sections = [
  { title: "Manage Profile", icon: Settings, description: "Edit your business information." },
  { title: "Upload Images", icon: Image, description: "Add photos to your listing." },
  { title: "Manage Links", icon: Link2, description: "Update website and social links." },
  { title: "Analytics", icon: BarChart3, description: "View profile views and engagement." },
];

export default function ProviderDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Provider Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your listing after claiming and verification.
      </p>

      <Card className="mt-8 border-[#D4AF37]/30 bg-[#D4AF37]/5">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#0B1F3A]">Claim Status: Pending</p>
            <p className="text-sm text-muted-foreground">
              Complete verification to unlock full dashboard access.
            </p>
          </div>
          <Button asChild className="rounded-full bg-[#0B1F3A]">
            <Link href="/providers/claim">Complete Claim</Link>
          </Button>
        </CardContent>
      </Card>

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
