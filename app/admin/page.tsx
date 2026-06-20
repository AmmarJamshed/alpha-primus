import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { providers, reviews } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Dashboard",
  path: "/admin",
});

export default function AdminDashboardPage() {
  const pendingReviews = reviews.filter((r) => !r.approved);
  const unclaimed = providers.filter((p) => !p.claimed).length;
  const verified = providers.filter((p) => p.verified).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage providers, reviews, imports, and platform analytics.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Providers", value: providers.length },
          { label: "Verified", value: verified },
          { label: "Unclaimed", value: unclaimed },
          { label: "Pending Reviews", value: pendingReviews.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-3xl font-bold text-[#0B1F3A]">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">All reviews approved.</p>
            ) : (
              pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.user_name}</p>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use <code className="rounded bg-muted px-1">scripts/discovery</code> to
              import providers via CSV or JSON. Imported records appear here for admin
              approval before publishing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
