import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, FileEdit, CheckCircle2, Clock } from "lucide-react";
import { useAdminPlaces } from "@/hooks/useAdmin";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: places = [], isLoading } = useAdminPlaces();
  const total = places.length;
  const published = places.filter((p) => p.status === "published").length;
  const review = places.filter((p) => p.status === "review").length;
  const drafts = places.filter((p) => p.status === "draft").length;

  const cards = [
    { label: "Total places", value: total, icon: MapPin, tone: "text-foreground" },
    { label: "Published", value: published, icon: CheckCircle2, tone: "text-success" },
    { label: "In review", value: review, icon: Clock, tone: "text-warning" },
    { label: "Drafts", value: drafts, icon: FileEdit, tone: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Content overview across the platform.</p>
        </div>
        <Link to="/admin/places">
          <Button variant="outline">Manage Places</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </CardTitle>
                <c.icon className={`h-4 w-4 ${c.tone}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">
                {isLoading ? "—" : c.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {places.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.region} · updated {new Date(p.updated_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
          {places.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No places yet. Create one to get started.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-success/10 text-success",
    review: "bg-warning/10 text-warning",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}
