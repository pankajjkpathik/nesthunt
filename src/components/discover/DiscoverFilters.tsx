import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SORT_OPTIONS,
  type DiscoveryFilters,
  type FacetGroup,
  type SortOption,
} from "@/lib/discovery/filters";

const ANY = "__any__";

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

interface Props {
  facets: FacetGroup[];
  filters: DiscoveryFilters;
  sort: SortOption;
  ceiling: number | null;
  onFilterChange: (key: keyof DiscoveryFilters, value: string | number | null) => void;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
  hasActive: boolean;
}

export function DiscoverFilters({
  facets,
  filters,
  sort,
  ceiling,
  onFilterChange,
  onSortChange,
  onClear,
  hasActive,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="discover-sort">Sort</Label>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger id="discover-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {facets.map((group) => {
        const current = (filters[group.key] as string) || "";
        return (
          <div key={group.key} className="space-y-2">
            <Label htmlFor={`discover-${group.key}`}>{group.label}</Label>
            <Select
              value={current === "" ? ANY : current}
              onValueChange={(v) => onFilterChange(group.key, v === ANY ? "" : v)}
            >
              <SelectTrigger id={`discover-${group.key}`}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any</SelectItem>
                {group.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}

      {ceiling !== null ? (
        <div className="space-y-2">
          <Label htmlFor="discover-price">
            Max starting price:{" "}
            {filters.priceMax === null ? "Any" : formatPrice(filters.priceMax)}
          </Label>
          <Slider
            id="discover-price"
            min={0}
            max={ceiling}
            step={Math.max(1, Math.round(ceiling / 100))}
            value={[filters.priceMax ?? ceiling]}
            onValueChange={([v]) => onFilterChange("priceMax", v >= ceiling ? null : v)}
            aria-label="Maximum starting price"
          />
        </div>
      ) : null}

      <Button variant="outline" size="sm" onClick={onClear} disabled={!hasActive} className="w-full">
        Clear all
      </Button>
    </div>
  );
}
