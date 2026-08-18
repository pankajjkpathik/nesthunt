import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoverResultCard } from "@/components/discover/DiscoverResultCard";
import {
  useDiscoveryProjects,
  useDiscoveryBuilders,
  useDiscoveryPlaces,
} from "@/hooks/useDiscovery";
import { matchesQuery, type DiscoveryResult } from "@/lib/services/discovery";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "all", label: "All" },
  { value: "project", label: "Projects" },
  { value: "builder", label: "Builders" },
  { value: "place", label: "Places" },
] as const;

type DiscoverType = (typeof TYPES)[number]["value"];

export const Route = createFileRoute("/discover")({
  validateSearch: (search: Record<string, unknown>) => ({
    type: (typeof search.type === "string" ? search.type : "all") as DiscoverType,
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: DiscoverPage,
  errorComponent: ({ error }) => (
    <AppLayout>
      <Container className="py-16">
        <p role="alert" className="text-sm text-muted-foreground">
          {error.message}
        </p>
      </Container>
    </AppLayout>
  ),
  head: () => ({
    meta: [
      { title: "Discover Projects, Builders & Places | NestHunt" },
      {
        name: "description",
        content:
          "Search verified projects, builders and places across NestHunt's property intelligence library.",
      },
      { property: "og:title", content: "Discover — NestHunt" },
      {
        property: "og:description",
        content: "Search verified projects, builders and places on NestHunt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function DiscoverPage() {
  const { type, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/discover" });

  const activeType: DiscoverType =
    TYPES.some((t) => t.value === type) ? type : "all";

  const projects = useDiscoveryProjects(activeType === "all" || activeType === "project");
  const builders = useDiscoveryBuilders(activeType === "all" || activeType === "builder");
  const places = useDiscoveryPlaces(activeType === "all" || activeType === "place");

  const isLoading = projects.isLoading || builders.isLoading || places.isLoading;
  const error = projects.error || builders.error || places.error;

  const results = useMemo<DiscoveryResult[]>(() => {
    const all: DiscoveryResult[] = [
      ...(activeType === "all" || activeType === "project" ? (projects.data ?? []) : []),
      ...(activeType === "all" || activeType === "builder" ? (builders.data ?? []) : []),
      ...(activeType === "all" || activeType === "place" ? (places.data ?? []) : []),
    ];
    return all.filter((item) => matchesQuery(item, q));
  }, [activeType, q, projects.data, builders.data, places.data]);

  const setSearch = (next: Partial<{ type: DiscoverType; q: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }), replace: true });

  return (
    <AppLayout>
      <Container className="py-10 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Discover
          </h1>
          <p className="mt-3 text-muted-foreground">
            Find published projects, builders and places. Results are navigation only — no
            ranking or recommendations.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={q}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Search by name, locality or builder"
              aria-label="Search projects, builders and places"
              className="pl-9"
            />
          </div>

          <div role="tablist" aria-label="Entity type" className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Button
                key={t.value}
                role="tab"
                aria-selected={activeType === t.value}
                variant={activeType === t.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSearch({ type: t.value })}
                className={cn("text-sm")}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8" aria-live="polite">
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-6 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Discovery is temporarily unavailable. Please try again.
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-border p-10 text-center">
              <p className="font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {q
                  ? `Nothing matches “${q}”. Try a different name or locality.`
                  : "No published entries are available yet."}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <DiscoverResultCard item={item} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Container>
    </AppLayout>
  );
}
