import { useMemo } from "react";
import { createFileRoute, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { Search, AlertCircle, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DiscoverResultCard } from "@/components/discover/DiscoverResultCard";
import { DiscoverFilters } from "@/components/discover/DiscoverFilters";
import {
  useDiscoveryProjects,
  useDiscoveryBuilders,
  useDiscoveryPlaces,
} from "@/hooks/useDiscovery";
import { matchesQuery, type DiscoveryResult } from "@/lib/services/discovery";
import {
  applyFilters,
  buildFacets,
  priceCeiling,
  sortResults,
  activeFilterCount,
  type DiscoveryFilters as Filters,
  type SortOption,
} from "@/lib/discovery/filters";
import { cn } from "@/lib/utils";

const TYPES = [
  { value: "all", label: "All" },
  { value: "project", label: "Projects" },
  { value: "builder", label: "Builders" },
  { value: "place", label: "Places" },
] as const;

type DiscoverType = (typeof TYPES)[number]["value"];

interface DiscoverSearch extends Partial<Filters> {
  type?: DiscoverType;
  q?: string;
  sort?: SortOption;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export const Route = createFileRoute("/discover")({
  validateSearch: (search: Record<string, unknown>): DiscoverSearch => ({
    type: (str(search.type) || "all") as DiscoverType,
    q: str(search.q) || "",
    sort: (str(search.sort) || "name_asc") as SortOption,
    location: str(search.location) || "",
    builder: str(search.builder) || "",
    status: str(search.status) || "",
    propertyType: str(search.propertyType) || "",
    configuration: str(search.configuration) || "",
    rera: str(search.rera) || "",
    priceMax:
      search.priceMax === undefined || search.priceMax === null || search.priceMax === ""
        ? null
        : Number(search.priceMax),
  }),
  search: {
    middlewares: [
      stripSearchParams({
        type: "all",
        q: "",
        sort: "name_asc",
        location: "",
        builder: "",
        status: "",
        propertyType: "",
        configuration: "",
        rera: "",
        priceMax: null,
      }),
    ],
  },
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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/discover" });

  const activeType: DiscoverType = TYPES.some((t) => t.value === search.type)
    ? search.type
    : "all";

  const filters: Filters = {
    location: search.location,
    builder: search.builder,
    status: search.status,
    propertyType: search.propertyType,
    configuration: search.configuration,
    rera: search.rera,
    priceMax:
      typeof search.priceMax === "number" && Number.isFinite(search.priceMax)
        ? search.priceMax
        : null,
  };

  const projects = useDiscoveryProjects(activeType === "all" || activeType === "project");
  const builders = useDiscoveryBuilders(activeType === "all" || activeType === "builder");
  const places = useDiscoveryPlaces(activeType === "all" || activeType === "place");

  const isLoading = projects.isLoading || builders.isLoading || places.isLoading;
  const error = projects.error || builders.error || places.error;

  const scoped = useMemo<DiscoveryResult[]>(
    () => [
      ...(activeType === "all" || activeType === "project" ? (projects.data ?? []) : []),
      ...(activeType === "all" || activeType === "builder" ? (builders.data ?? []) : []),
      ...(activeType === "all" || activeType === "place" ? (places.data ?? []) : []),
    ],
    [activeType, projects.data, builders.data, places.data],
  );

  const facets = useMemo(() => buildFacets(scoped), [scoped]);
  const ceiling = useMemo(() => priceCeiling(scoped), [scoped]);

  const results = useMemo(() => {
    const searched = scoped.filter((item) => matchesQuery(item, search.q));
    return sortResults(applyFilters(searched, filters), search.sort);
  }, [scoped, search.q, search.sort, filters]);

  const counts = useMemo(() => {
    const c = { project: 0, builder: 0, place: 0 };
    results.forEach((r) => {
      c[r.kind] += 1;
    });
    return c;
  }, [results]);

  const setSearch = (next: Partial<DiscoverSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  const handleFilterChange = (key: keyof Filters, value: string | number | null) =>
    setSearch({ [key]: value } as Partial<DiscoverSearch>);

  const clearAll = () =>
    navigate({
      search: {
        type: "all",
        q: "",
        sort: "name_asc",
        location: "",
        builder: "",
        status: "",
        propertyType: "",
        configuration: "",
        rera: "",
        priceMax: null,
      },
    });

  const activeCount =
    activeFilterCount(filters) +
    (search.q ? 1 : 0) +
    (activeType !== "all" ? 1 : 0) +
    (search.sort !== "name_asc" ? 1 : 0);

  const filterPanel = (
    <DiscoverFilters
      facets={facets}
      filters={filters}
      sort={search.sort}
      ceiling={ceiling}
      onFilterChange={handleFilterChange}
      onSortChange={(s) => setSearch({ sort: s })}
      onClear={clearAll}
      hasActive={activeCount > 0}
    />
  );

  const countLabel = [
    counts.project ? `${counts.project} Project${counts.project === 1 ? "" : "s"}` : null,
    counts.builder ? `${counts.builder} Builder${counts.builder === 1 ? "" : "s"}` : null,
    counts.place ? `${counts.place} Place${counts.place === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppLayout>
      <Container className="py-10 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Discover
          </h1>
          <p className="mt-3 text-muted-foreground">
            Find published projects, builders and places by factual attributes. Results are
            navigation only — no ranking or recommendations.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={search.q}
                onChange={(e) => setSearch({ q: e.target.value })}
                placeholder="Search by name, locality or builder"
                aria-label="Search projects, builders and places"
                className="pl-9"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                  Filters
                  {activeCount > 0 ? (
                    <Badge variant="secondary" className="ml-2">
                      {activeCount}
                    </Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] overflow-y-auto sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{filterPanel}</div>
              </SheetContent>
            </Sheet>
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          <div aria-live="polite">
            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-border p-6 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                Discovery is temporarily unavailable. Please try again.
              </div>
            ) : isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-lg border border-border p-10 text-center">
                <p className="font-medium text-foreground">No results found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeCount > 0
                    ? "Nothing matches the current search and filters."
                    : "No published entries are available yet."}
                </p>
                {activeCount > 0 ? (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                    Clear all
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">{countLabel}</p>
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((item) => (
                    <li key={`${item.kind}-${item.id}`}>
                      <DiscoverResultCard item={item} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </Container>
    </AppLayout>
  );
}
