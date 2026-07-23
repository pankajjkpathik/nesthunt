import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, AlertTriangle, ImageOff, Building2, MapPin, FileText } from "lucide-react";
import { useRelationshipHealth } from "@/hooks/useRelationships";

export const Route = createFileRoute("/admin/relationships/")({
  head: () => ({
    meta: [
      { title: "Relationship Health · NestHunt Admin" },
      { name: "description", content: "Monitor NHOS relationship health and orphaned entities." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RelationshipDashboard,
});

function RelationshipDashboard() {
  return (
    <AdminGuard>
      <AdminShell>
        <Dashboard />
      </AdminShell>
    </AdminGuard>
  );
}

function Dashboard() {
  const { data, isLoading } = useRelationshipHealth();

  const kpis = [
    { label: "Total relationships", value: data?.totalRelationships ?? 0, icon: Network },
    { label: "Orphaned projects", value: data?.orphanedProjects.length ?? 0, icon: AlertTriangle },
    { label: "Unlinked media", value: data?.unlinkedMedia.length ?? 0, icon: ImageOff },
    { label: "Builders w/o projects", value: data?.buildersWithoutProjects.length ?? 0, icon: Building2 },
    { label: "Places w/o projects", value: data?.placesWithoutProjects.length ?? 0, icon: MapPin },
    { label: "Projects missing SEO", value: data?.projectsMissingSeo.length ?? 0, icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Relationship Health</h1>
        <p className="text-sm text-muted-foreground">
          Orphaned records, missing SEO, and unlinked assets across NHOS.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <k.icon className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">{k.label}</span>
              </div>
              <div className="mt-2 font-heading text-2xl font-semibold">
                {isLoading ? "…" : k.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <IssueList
        title="Orphaned projects"
        description="Projects missing a builder or place."
        empty="Every project has a builder and place."
        items={(data?.orphanedProjects ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          badge: `missing ${p.missing}`,
          href: `/admin/projects/${p.id}`,
        }))}
      />

      <IssueList
        title="Places without projects"
        description="Places with no linked projects."
        empty="Every place has projects."
        items={(data?.placesWithoutProjects ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          href: `/admin/places/${p.id}`,
        }))}
      />

      <IssueList
        title="Builders without projects"
        description="Builders with zero projects on the platform."
        empty="Every builder has projects."
        items={(data?.buildersWithoutProjects ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          href: `/admin/builders/${b.id}`,
        }))}
      />

      <IssueList
        title="Places without builders"
        description="Places that no builder currently serves."
        empty="Every place has at least one builder."
        items={(data?.placesWithoutBuilders ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          href: `/admin/places/${p.id}`,
        }))}
      />

      <IssueList
        title="Builders missing logo"
        description="Set a logo in the Media tab."
        empty="All builders have logos."
        items={(data?.buildersMissingLogo ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          href: `/admin/builders/${b.id}`,
        }))}
      />

      <IssueList
        title="Projects missing SEO"
        description="Add SEO title & description in the SEO tab."
        empty="All projects have SEO metadata."
        items={(data?.projectsMissingSeo ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          href: `/admin/projects/${p.id}`,
        }))}
      />

      <IssueList
        title="Unlinked media"
        description="Assets not used by any place, builder or project."
        empty="Every asset is in use."
        items={(data?.unlinkedMedia ?? []).map((m) => ({
          id: m.id,
          name: m.file_name,
          badge: m.folder,
          href: `/admin/media`,
        }))}
      />
    </div>
  );
}

function IssueList({
  title,
  description,
  empty,
  items,
}: {
  title: string;
  description: string;
  empty: string;
  items: Array<{ id: string; name: string; badge?: string; href: string }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Badge variant={items.length ? "secondary" : "outline"}>{items.length}</Badge>
        </header>
        {items.length === 0 ? (
          <p className="rounded border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            {empty}
          </p>
        ) : (
          <ul className="divide-y divide-border rounded border border-border">
            {items.slice(0, 20).map((i) => (
              <li key={i.id} className="flex items-center justify-between p-2 text-sm">
                <Link to={i.href} className="min-w-0 flex-1 truncate hover:text-accent">
                  {i.name}
                </Link>
                {i.badge ? (
                  <Badge variant="outline" className="ml-2 text-[10px] uppercase">
                    {i.badge}
                  </Badge>
                ) : null}
              </li>
            ))}
            {items.length > 20 ? (
              <li className="p-2 text-center text-xs text-muted-foreground">
                and {items.length - 20} more…
              </li>
            ) : null}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
