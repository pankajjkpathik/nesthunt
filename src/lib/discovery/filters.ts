import type { DiscoveryResult } from "@/lib/services/discovery";

/**
 * Discovery filtering/sorting helpers (LAUNCH-001B).
 * Factual, data-derived only. No decision scores, no ranking, no recommendations.
 */

export type SortOption = "name_asc" | "name_desc" | "recent";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "recent", label: "Recently updated" },
];

export interface DiscoveryFilters {
  builder: string;
  status: string;
  propertyType: string;
  rera: string; // "" | "registered"
  configuration: string;
  location: string;
  priceMax: number | null;
}

export const EMPTY_FILTERS: DiscoveryFilters = {
  builder: "",
  status: "",
  propertyType: "",
  rera: "",
  configuration: "",
  location: "",
  priceMax: null,
};

export interface FacetGroup {
  key: keyof DiscoveryFilters;
  label: string;
  options: string[];
}

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== ""))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function projectConfigurations(item: DiscoveryResult): string[] {
  if (item.kind !== "project" || !item.configuration) return [];
  return item.configuration
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Facets are derived from the live published dataset — a group is only shown
 * when the underlying field is actually populated. Never fabricated.
 */
export function buildFacets(items: DiscoveryResult[]): FacetGroup[] {
  const projects = items.filter((i) => i.kind === "project");
  const builders = items.filter((i) => i.kind === "builder");
  const places = items.filter((i) => i.kind === "place");

  const groups: FacetGroup[] = [
    {
      key: "location",
      label: "Location",
      options: uniqueSorted([
        ...projects.map((p) => (p.kind === "project" ? p.locality : null)),
        ...builders.map((b) => (b.kind === "builder" ? (b.city ?? b.state) : null)),
        ...places.map((p) => (p.kind === "place" ? (p.city ?? p.region) : null)),
      ]),
    },
    {
      key: "builder",
      label: "Builder",
      options: uniqueSorted(projects.map((p) => (p.kind === "project" ? p.builderName : null))),
    },
    {
      key: "status",
      label: "Project status",
      options: uniqueSorted(
        projects.map((p) => (p.kind === "project" ? (p.constructionStatus ?? p.status) : null)),
      ),
    },
    {
      key: "propertyType",
      label: "Property type",
      options: uniqueSorted(projects.map((p) => (p.kind === "project" ? p.propertyType : null))),
    },
    {
      key: "configuration",
      label: "Configuration",
      options: uniqueSorted(projects.flatMap(projectConfigurations)),
    },
    {
      key: "rera",
      label: "RERA",
      options: projects.some((p) => p.kind === "project" && !!p.reraNumber)
        ? ["Registered"]
        : [],
    },
  ];

  return groups.filter((g) => g.options.length > 0);
}

/** Highest starting price in the dataset, or null when no project has a price. */
export function priceCeiling(items: DiscoveryResult[]): number | null {
  const prices = items
    .filter((i): i is Extract<DiscoveryResult, { kind: "project" }> => i.kind === "project")
    .map((p) => p.startingPrice)
    .filter((v): v is number => typeof v === "number");
  return prices.length ? Math.max(...prices) : null;
}

export function applyFilters(
  items: DiscoveryResult[],
  filters: DiscoveryFilters,
): DiscoveryResult[] {
  return items.filter((item) => {
    if (filters.location) {
      const loc =
        item.kind === "project"
          ? item.locality
          : item.kind === "builder"
            ? (item.city ?? item.state)
            : (item.city ?? item.region);
      if (loc !== filters.location) return false;
    }

    if (item.kind !== "project") {
      // Project-only filters exclude non-project entities when active.
      if (
        filters.builder ||
        filters.status ||
        filters.propertyType ||
        filters.configuration ||
        filters.rera ||
        filters.priceMax !== null
      ) {
        return false;
      }
      return true;
    }

    if (filters.builder && item.builderName !== filters.builder) return false;
    if (filters.status && (item.constructionStatus ?? item.status) !== filters.status) return false;
    if (filters.propertyType && item.propertyType !== filters.propertyType) return false;
    if (filters.rera && !item.reraNumber) return false;
    if (filters.configuration && !projectConfigurations(item).includes(filters.configuration))
      return false;
    if (filters.priceMax !== null) {
      if (item.startingPrice === null || item.startingPrice > filters.priceMax) return false;
    }
    return true;
  });
}

export function sortResults(items: DiscoveryResult[], sort: SortOption): DiscoveryResult[] {
  const copy = [...items];
  if (sort === "name_desc") return copy.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "recent")
    return copy.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  return copy.sort((a, b) => a.name.localeCompare(b.name));
}

export function activeFilterCount(filters: DiscoveryFilters): number {
  return (
    Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined).length
  );
}
