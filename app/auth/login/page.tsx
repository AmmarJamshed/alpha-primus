import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Sign In",
  path: "/auth/login",
});

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-bold text-[#0B1F3A]">Welcome back</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Sign in to save providers, leave reviews, and manage your profile.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#0B1F3A]">
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/auth/signup" className="text-[#0B1F3A] underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
