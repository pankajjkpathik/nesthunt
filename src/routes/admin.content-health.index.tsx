import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  ImageOff,
  Search,
  Tags,
  Sparkles,
  MapPin,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStructuredHealth } from "@/hooks/useStructuredHealth";
import type { ContentHealthEntry } from "@/lib/services/structuredHealth";

export const Route = createFileRoute("/admin/content-health/")({
  component: ContentHealthPage,
});

function ContentHealthPage() {
  const { data, isLoading } = useStructuredHealth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Content Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit unused, duplicate, and incomplete structured content.
        </p>
      </header>

      {isLoading || !data ? (
        <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
          Loading report…
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <TotalCard icon={Tags} label="Categories" value={data.totals.categories} />
            <TotalCard icon={Sparkles} label="Amenities" value={data.totals.amenities} />
            <TotalCard icon={MapPin} label="Infrastructure" value={data.totals.infrastructure} />
            <TotalCard icon={Home} label="Unit Types" value={data.totals.unitTypes} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <UnusedCard
              title="Unused Categories"
              items={data.unused.categories}
              hrefFor={(id) => ({ to: "/admin/categories/$id" as const, params: { id } })}
            />
            <UnusedCard
              title="Unused Amenities"
              items={data.unused.amenities}
              hrefFor={(id) => ({ to: "/admin/amenities/$id" as const, params: { id } })}
            />
            <UnusedCard
              title="Unused Infrastructure"
              items={data.unused.infrastructure}
              hrefFor={(id) => ({ to: "/admin/infrastructure/$id" as const, params: { id } })}
            />
            <UnusedCard
              title="Unused Unit Types"
              items={data.unused.unitTypes}
              hrefFor={(id) => ({ to: "/admin/unit-types/$id" as const, params: { id } })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <IssueCard
              title="Missing icons"
              icon={ImageOff}
              groups={[
                { label: "Categories", items: data.missingIcons.categories, base: "categories" },
                { label: "Amenities", items: data.missingIcons.amenities, base: "amenities" },
              ]}
            />
            <IssueCard
              title="Missing SEO"
              icon={Search}
              groups={[
                { label: "Categories", items: data.missingSeo.categories, base: "categories" },
                { label: "Amenities", items: data.missingSeo.amenities, base: "amenities" },
              ]}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Copy className="h-4 w-4" /> Duplicate slugs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DuplicatesBlock label="Categories" rows={data.duplicates.categories} />
              <DuplicatesBlock label="Amenities" rows={data.duplicates.amenities} />
              <DuplicatesBlock label="Infrastructure" rows={data.duplicates.infrastructure} />
              <DuplicatesBlock label="Unit Types" rows={data.duplicates.unitTypes} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function TotalCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tags;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function UnusedCard({
  title,
  items,
  hrefFor,
}: {
  title: string;
  items: ContentHealthEntry[];
  hrefFor: (id: string) => { to: string; params: { id: string } };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <Badge variant="outline">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All in use.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.slice(0, 8).map((i) => {
              const href = hrefFor(i.id);
              return (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{i.slug}</p>
                  </div>
                  <Link
                    to={href.to}
                    params={href.params}
                    className="text-xs text-accent hover:underline"
                  >
                    Open <ExternalLink className="ml-1 inline h-3 w-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function IssueCard({
  title,
  icon: Icon,
  groups,
}: {
  title: string;
  icon: typeof AlertTriangle;
  groups: Array<{ label: string; items: ContentHealthEntry[]; base: string }>;
}) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4" /> {title}
          </span>
          <Badge variant="outline">{total}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              {g.label}
            </p>
            {g.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">All good.</p>
            ) : (
              <ul className="space-y-1">
                {g.items.slice(0, 6).map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{i.name}</span>
                    <a
                      href={`/admin/${g.base}/${i.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Fix
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DuplicatesBlock({
  label,
  rows,
}: {
  label: string;
  rows: Array<{ slug: string; count: number }>;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => (
          <Badge key={r.slug} variant="destructive">
            {r.slug} × {r.count}
          </Badge>
        ))}
      </div>
    </div>
  );
}
