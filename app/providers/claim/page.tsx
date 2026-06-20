import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Claim Your Profile",
  description:
    "Are you a therapist, coach, or wellness provider? Claim and manage your Alpha Primus listing.",
  path: "/providers/claim",
});

export default function ClaimProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Claim Your Profile</h1>
      <p className="mt-3 text-muted-foreground">
        Search for your existing listing and submit a claim request. Our team
        will verify your identity via email or domain verification.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Find Your Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business">Business Name</Label>
              <Input id="business" placeholder="Your practice or business name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input id="email" type="email" placeholder="hello@yourpractice.com" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#0B1F3A]">
              Search & Claim
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have a listing yet?{" "}
        <Link href="/auth/signup" className="text-[#0B1F3A] underline">
          Create a provider account
        </Link>
      </p>
    </div>
  );
}
