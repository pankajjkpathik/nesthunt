import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useAdminPlaces,
  useBulkDeletePlaces,
  useBulkUpdatePlaceStatus,
  useDeletePlace,
  useDuplicatePlace,
} from "@/hooks/useAdmin";
import type { PlaceHero, PlaceRow, PlaceStatus } from "@/lib/services/places-admin";

export const Route = createFileRoute("/admin/places/")({
  component: PlacesList,
});

type SortKey = "name" | "state" | "city" | "status" | "updated_at";
type SortDir = "asc" | "desc";

const ALL_COLUMNS = [
  { key: "image", label: "Image" },
  { key: "name", label: "Name" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "slug", label: "Slug" },
  { key: "status", label: "Status" },
  { key: "featured", label: "Featured" },
  { key: "updated", label: "Updated" },
] as const;
type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

const PAGE_SIZES = [10, 25, 50, 100];

function PlacesList() {
  const { data: places = [], isLoading, error } = useAdminPlaces();
  const deleteMut = useDeletePlace();
  const duplicateMut = useDuplicatePlace();
  const bulkStatusMut = useBulkUpdatePlaceStatus();
  const bulkDeleteMut = useBulkDeletePlaces();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(
    new Set(ALL_COLUMNS.map((c) => c.key)),
  );

  const stateOptions = useMemo(
    () => Array.from(new Set(places.map((p) => (p as PlaceRow & { state?: string }).state).filter(Boolean))).sort(),
    [places],
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(places.map((p) => (p as PlaceRow & { city?: string }).city).filter(Boolean))).sort(),
    [places],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return places.filter((p) => {
      const px = p as PlaceRow & { state?: string; city?: string };
      if (status !== "all" && p.status !== status) return false;
      if (stateFilter !== "all" && px.state !== stateFilter) return false;
      if (cityFilter !== "all" && px.city !== cityFilter) return false;
      if (featuredFilter === "featured" && !p.featured) return false;
      if (featuredFilter === "not-featured" && p.featured) return false;
      if (term) {
        const hay = `${p.name} ${p.slug} ${px.state ?? ""} ${px.city ?? ""} ${p.region}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [places, q, status, stateFilter, cityFilter, featuredFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const ax = a as PlaceRow & { state?: string; city?: string };
      const bx = b as PlaceRow & { state?: string; city?: string };
      const va = (
        sortKey === "name" ? a.name
        : sortKey === "state" ? (ax.state ?? "")
        : sortKey === "city" ? (ax.city ?? "")
        : sortKey === "status" ? a.status
        : a.updated_at
      ).toString().toLowerCase();
      const vb = (
        sortKey === "name" ? b.name
        : sortKey === "state" ? (bx.state ?? "")
        : sortKey === "city" ? (bx.city ?? "")
        : sortKey === "status" ? b.status
        : b.updated_at
      ).toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function togglePageSelection(checked: boolean) {
    const next = new Set(selected);
    for (const r of pageRows) {
      if (checked) next.add(r.id);
      else next.delete(r.id);
    }
    setSelected(next);
  }

  function toggleRow(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  const selectedIds = Array.from(selected);
  const hasSelection = selectedIds.length > 0;

  async function runBulkStatus(next: PlaceStatus) {
    try {
      await bulkStatusMut.mutateAsync({ ids: selectedIds, status: next });
      toast.success(`${selectedIds.length} place${selectedIds.length === 1 ? "" : "s"} updated`);
      setSelected(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function runBulkDuplicate() {
    try {
      let ok = 0;
      for (const id of selectedIds) {
        await duplicateMut.mutateAsync(id);
        ok += 1;
      }
      toast.success(`Duplicated ${ok} place${ok === 1 ? "" : "s"}`);
      setSelected(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const filtersDirty =
    q.trim() ||
    status !== "all" ||
    stateFilter !== "all" ||
    cityFilter !== "all" ||
    featuredFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Places</h1>
          <p className="text-sm text-muted-foreground">
            {places.length} place{places.length === 1 ? "" : "s"} in the system.
          </p>
        </div>
        <Link to="/admin/places/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Place
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, city, state, slug…"
                className="pl-9"
                aria-label="Search places"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_COLUMNS.map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.key}
                    checked={visibleCols.has(c.key)}
                    onCheckedChange={(checked) => {
                      const next = new Set(visibleCols);
                      if (checked) next.add(c.key);
                      else next.delete(c.key);
                      setVisibleCols(next);
                    }}
                  >
                    {c.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterSelect
              value={status}
              onChange={(v) => { setStatus(v); setPage(1); }}
              placeholder="Status"
              options={[
                { value: "all", label: "All statuses" },
                { value: "draft", label: "Draft" },
                { value: "review", label: "In review" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <FilterSelect
              value={stateFilter}
              onChange={(v) => { setStateFilter(v); setPage(1); }}
              placeholder="State"
              options={[{ value: "all", label: "All states" }, ...stateOptions.map((s) => ({ value: s!, label: s! }))]}
            />
            <FilterSelect
              value={cityFilter}
              onChange={(v) => { setCityFilter(v); setPage(1); }}
              placeholder="City"
              options={[{ value: "all", label: "All cities" }, ...cityOptions.map((s) => ({ value: s!, label: s! }))]}
            />
            <FilterSelect
              value={featuredFilter}
              onChange={(v) => { setFeaturedFilter(v); setPage(1); }}
              placeholder="Featured"
              options={[
                { value: "all", label: "All places" },
                { value: "featured", label: "Featured only" },
                { value: "not-featured", label: "Not featured" },
              ]}
            />
            {filtersDirty ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setStateFilter("all");
                  setCityFilter("all");
                  setFeaturedFilter("all");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {hasSelection ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => runBulkStatus("published")} disabled={bulkStatusMut.isPending}>
              Publish
            </Button>
            <Button size="sm" variant="outline" onClick={() => runBulkStatus("draft")} disabled={bulkStatusMut.isPending}>
              Move to draft
            </Button>
            <Button size="sm" variant="outline" onClick={runBulkDuplicate} disabled={duplicateMut.isPending}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button size="sm" variant="outline" disabled title="Coming soon">
              Export
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPendingBulkDelete(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="p-8 text-center text-sm text-destructive">Failed to load places.</div>
          ) : sorted.length === 0 ? (
            <EmptyState hasPlaces={places.length > 0} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={(v) => togglePageSelection(Boolean(v))}
                        aria-label="Select all on page"
                      />
                    </TableHead>
                    {visibleCols.has("image") ? <TableHead className="w-16">Image</TableHead> : null}
                    {visibleCols.has("name") ? (
                      <TableHead>
                        <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>
                          Name
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("state") ? (
                      <TableHead>
                        <SortButton active={sortKey === "state"} dir={sortDir} onClick={() => toggleSort("state")}>
                          State
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("city") ? (
                      <TableHead>
                        <SortButton active={sortKey === "city"} dir={sortDir} onClick={() => toggleSort("city")}>
                          City
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("slug") ? <TableHead>Slug</TableHead> : null}
                    {visibleCols.has("status") ? (
                      <TableHead>
                        <SortButton active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")}>
                          Status
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("featured") ? <TableHead>Featured</TableHead> : null}
                    {visibleCols.has("updated") ? (
                      <TableHead>
                        <SortButton active={sortKey === "updated_at"} dir={sortDir} onClick={() => toggleSort("updated_at")}>
                          Updated
                        </SortButton>
                      </TableHead>
                    ) : null}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((p) => {
                    const px = p as PlaceRow & { state?: string; city?: string };
                    const hero = (p.hero ?? {}) as PlaceHero;
                    const img = hero.coverImageUrl || hero.heroImageUrl;
                    return (
                      <TableRow key={p.id} data-selected={selected.has(p.id)}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => toggleRow(p.id, Boolean(v))}
                            aria-label={`Select ${p.name}`}
                          />
                        </TableCell>
                        {visibleCols.has("image") ? (
                          <TableCell>
                            {img ? (
                              <img src={img} alt="" className="h-10 w-10 rounded-md object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-md border border-dashed border-border bg-muted/30" />
                            )}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("name") ? (
                          <TableCell>
                            <button
                              onClick={() => navigate({ to: "/admin/places/$id", params: { id: p.id } })}
                              className="text-left font-medium text-foreground hover:text-accent"
                            >
                              {p.name}
                            </button>
                          </TableCell>
                        ) : null}
                        {visibleCols.has("state") ? <TableCell className="text-sm">{px.state || "—"}</TableCell> : null}
                        {visibleCols.has("city") ? <TableCell className="text-sm">{px.city || "—"}</TableCell> : null}
                        {visibleCols.has("slug") ? (
                          <TableCell className="text-xs text-muted-foreground">/{p.slug}</TableCell>
                        ) : null}
                        {visibleCols.has("status") ? (
                          <TableCell><StatusBadge status={p.status} /></TableCell>
                        ) : null}
                        {visibleCols.has("featured") ? (
                          <TableCell className="text-xs">{p.featured ? "★" : "—"}</TableCell>
                        ) : null}
                        {visibleCols.has("updated") ? (
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(p.updated_at).toLocaleDateString()}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {p.status === "published" ? (
                              <a
                                href={`/places/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                                aria-label={`Preview ${p.name}`}
                                title="Preview live"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <a
                                href={`/places/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                                aria-label={`Preview ${p.name}`}
                                title="Preview draft"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                try {
                                  await duplicateMut.mutateAsync(p.id);
                                  toast.success("Place duplicated");
                                } catch (e) {
                                  toast.error((e as Error).message);
                                }
                              }}
                              aria-label={`Duplicate ${p.name}`}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate({ to: "/admin/places/$id", params: { id: p.id } })}
                              aria-label={`Edit ${p.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPendingDelete(p.id)}
                              aria-label={`Delete ${p.name}`}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {sorted.length > 0 ? (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-3 text-xs text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this place?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the place and its report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteMut.mutateAsync(pendingDelete);
                  toast.success("Place deleted");
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setPendingDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingBulkDelete} onOpenChange={setPendingBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} places?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected places and their reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await bulkDeleteMut.mutateAsync(selectedIds);
                  toast.success(`${selectedIds.length} places deleted`);
                  setSelected(new Set());
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setPendingBulkDelete(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[9rem]" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SortButton({
  active,
  dir,
  onClick,
  children,
}: {
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${active ? "text-foreground" : "opacity-40"}`} />
      {active ? <span className="sr-only">{dir === "asc" ? "ascending" : "descending"}</span> : null}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-success/10 text-success",
    review: "bg-warning/10 text-warning",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-muted text-muted-foreground line-through",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasPlaces }: { hasPlaces: boolean }) {
  return (
    <div className="p-12 text-center">
      <h3 className="text-base font-medium text-foreground">
        {hasPlaces ? "No places match your filters." : "No places found."}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasPlaces
          ? "Adjust the filters above or clear them to see everything."
          : "Create your first Place to begin building NestHunt."}
      </p>
      {!hasPlaces ? (
        <Link to="/admin/places/new" className="mt-4 inline-block">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create first Place
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
