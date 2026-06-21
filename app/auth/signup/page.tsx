import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Create Account",
  path: "/auth/signup",
});

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-bold text-[#0B1F3A]">
        Join Alpha Primus
      </h1>
      <p className="mt-2 text-center text-muted-foreground">
        Create an account to save providers, sync your AI wellness guide, and track
        your growth journey.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </div>
  );
}
