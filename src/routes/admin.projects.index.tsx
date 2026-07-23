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
  BadgeCheck,
  Star,
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
  useAdminProjects,
  useBulkDeleteProjects,
  useBulkDuplicateProjects,
  useBulkUpdateProjectPublishStatus,
  useDeleteProject,
  useDuplicateProject,
} from "@/hooks/useAdminProjects";
import { useAdminBuilders } from "@/hooks/useAdminBuilders";
import { useAdminPlaces } from "@/hooks/useAdmin";
import type { ProjectPublishStatus } from "@/lib/services/projects-admin";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectsList,
});

type SortKey =
  | "name"
  | "publish_status"
  | "property_type"
  | "starting_price"
  | "possession_date"
  | "updated_at";
type SortDir = "asc" | "desc";

const ALL_COLUMNS = [
  { key: "hero", label: "Hero Image" },
  { key: "name", label: "Project Name" },
  { key: "builder", label: "Builder" },
  { key: "place", label: "Place" },
  { key: "property_type", label: "Property Type" },
  { key: "construction", label: "Construction" },
  { key: "publish_status", label: "Publication" },
  { key: "featured", label: "Featured" },
  { key: "rera", label: "RERA" },
  { key: "starting_price", label: "Starting Price" },
  { key: "possession", label: "Possession" },
  { key: "updated", label: "Updated" },
] as const;
type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

const DEFAULT_COLS = new Set<ColumnKey>([
  "hero",
  "name",
  "builder",
  "place",
  "property_type",
  "construction",
  "publish_status",
  "starting_price",
  "possession",
  "updated",
]);

const PAGE_SIZES = [10, 25, 50, 100];

function formatINR(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function ProjectsList() {
  const { data: projects = [], isLoading, error } = useAdminProjects();
  const { data: builders = [] } = useAdminBuilders();
  const { data: places = [] } = useAdminPlaces();
  const deleteMut = useDeleteProject();
  const duplicateMut = useDuplicateProject();
  const bulkStatusMut = useBulkUpdateProjectPublishStatus();
  const bulkDeleteMut = useBulkDeleteProjects();
  const bulkDuplicateMut = useBulkDuplicateProjects();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [builderFilter, setBuilderFilter] = useState<string>("all");
  const [placeFilter, setPlaceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [constructionFilter, setConstructionFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [reraFilter, setReraFilter] = useState<string>("all");
  const [possessionYearFilter, setPossessionYearFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(DEFAULT_COLS);

  const builderMap = useMemo(() => {
    const m = new Map<string, string>();
    builders.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [builders]);
  const placeMap = useMemo(() => {
    const m = new Map<string, string>();
    places.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [places]);

  const typeOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.property_type).filter(Boolean))).sort(),
    [projects],
  );
  const constructionOptions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.construction_status).filter(Boolean))).sort(),
    [projects],
  );
  const possessionYearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((p) => (p.possession_date ? new Date(p.possession_date).getFullYear() : null))
            .filter((y): y is number => y != null),
        ),
      ).sort((a, b) => a - b),
    [projects],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (status !== "all" && (p.publish_status ?? "draft") !== status) return false;
      if (builderFilter !== "all" && p.builder_id !== builderFilter) return false;
      if (placeFilter !== "all" && p.place_id !== placeFilter) return false;
      if (typeFilter !== "all" && p.property_type !== typeFilter) return false;
      if (constructionFilter !== "all" && p.construction_status !== constructionFilter) return false;
      if (featuredFilter === "featured" && !p.featured) return false;
      if (featuredFilter === "not-featured" && p.featured) return false;
      if (reraFilter === "yes" && !p.rera_number) return false;
      if (reraFilter === "no" && p.rera_number) return false;
      if (possessionYearFilter !== "all") {
        const yr = p.possession_date ? new Date(p.possession_date).getFullYear() : null;
        if (String(yr ?? "") !== possessionYearFilter) return false;
      }
      if (term) {
        const bname = p.builder_id ? builderMap.get(p.builder_id) ?? "" : "";
        const pname = p.place_id ? placeMap.get(p.place_id) ?? "" : "";
        const hay =
          `${p.name} ${p.slug} ${p.rera_number ?? ""} ${bname} ${pname}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [
    projects, q, status, builderFilter, placeFilter, typeFilter, constructionFilter,
    featuredFilter, reraFilter, possessionYearFilter, builderMap, placeMap,
  ]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va =
        sortKey === "name" ? a.name.toLowerCase()
        : sortKey === "publish_status" ? (a.publish_status ?? "").toLowerCase()
        : sortKey === "property_type" ? (a.property_type ?? "").toLowerCase()
        : sortKey === "starting_price" ? Number(a.starting_price ?? 0)
        : sortKey === "possession_date" ? (a.possession_date ?? "")
        : a.updated_at;
      const vb =
        sortKey === "name" ? b.name.toLowerCase()
        : sortKey === "publish_status" ? (b.publish_status ?? "").toLowerCase()
        : sortKey === "property_type" ? (b.property_type ?? "").toLowerCase()
        : sortKey === "starting_price" ? Number(b.starting_price ?? 0)
        : sortKey === "possession_date" ? (b.possession_date ?? "")
        : b.updated_at;
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
    else { setSortKey(key); setSortDir("asc"); }
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  function togglePageSelection(checked: boolean) {
    const next = new Set(selected);
    for (const r of pageRows) { if (checked) next.add(r.id); else next.delete(r.id); }
    setSelected(next);
  }
  function toggleRow(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id); else next.delete(id);
    setSelected(next);
  }
  const selectedIds = Array.from(selected);
  const hasSelection = selectedIds.length > 0;

  async function runBulkStatus(next: ProjectPublishStatus) {
    try {
      await bulkStatusMut.mutateAsync({ ids: selectedIds, status: next });
      toast.success(`${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} updated`);
      setSelected(new Set());
    } catch (e) { toast.error((e as Error).message); }
  }
  async function runBulkDuplicate() {
    try {
      await bulkDuplicateMut.mutateAsync(selectedIds);
      toast.success(`Duplicated ${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"}`);
      setSelected(new Set());
    } catch (e) { toast.error((e as Error).message); }
  }

  const filtersDirty =
    q.trim() || status !== "all" || builderFilter !== "all" || placeFilter !== "all"
    || typeFilter !== "all" || constructionFilter !== "all" || featuredFilter !== "all"
    || reraFilter !== "all" || possessionYearFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"} in the system.
          </p>
        </div>
        <Link to="/admin/projects/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Project</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search name, slug, RERA, builder, place…"
                className="pl-9"
                aria-label="Search projects"
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
                      if (checked) next.add(c.key); else next.delete(c.key);
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
              placeholder="Publication"
              options={[
                { value: "all", label: "All statuses" },
                { value: "draft", label: "Draft" },
                { value: "review", label: "In review" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
            />
            <FilterSelect
              value={builderFilter}
              onChange={(v) => { setBuilderFilter(v); setPage(1); }}
              placeholder="Builder"
              options={[{ value: "all", label: "All builders" }, ...builders.map((b) => ({ value: b.id, label: b.name }))]}
            />
            <FilterSelect
              value={placeFilter}
              onChange={(v) => { setPlaceFilter(v); setPage(1); }}
              placeholder="Place"
              options={[{ value: "all", label: "All places" }, ...places.map((p) => ({ value: p.id, label: p.name }))]}
            />
            <FilterSelect
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
              placeholder="Type"
              options={[{ value: "all", label: "All types" }, ...typeOptions.map((t) => ({ value: t!, label: t! }))]}
            />
            <FilterSelect
              value={constructionFilter}
              onChange={(v) => { setConstructionFilter(v); setPage(1); }}
              placeholder="Construction"
              options={[{ value: "all", label: "All construction" }, ...constructionOptions.map((s) => ({ value: s!, label: s! }))]}
            />
            <FilterSelect
              value={featuredFilter}
              onChange={(v) => { setFeaturedFilter(v); setPage(1); }}
              placeholder="Featured"
              options={[
                { value: "all", label: "All projects" },
                { value: "featured", label: "Featured only" },
                { value: "not-featured", label: "Not featured" },
              ]}
            />
            <FilterSelect
              value={reraFilter}
              onChange={(v) => { setReraFilter(v); setPage(1); }}
              placeholder="RERA"
              options={[
                { value: "all", label: "Any RERA" },
                { value: "yes", label: "RERA approved" },
                { value: "no", label: "No RERA" },
              ]}
            />
            <FilterSelect
              value={possessionYearFilter}
              onChange={(v) => { setPossessionYearFilter(v); setPage(1); }}
              placeholder="Possession"
              options={[
                { value: "all", label: "Any year" },
                ...possessionYearOptions.map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
            {filtersDirty ? (
              <Button variant="ghost" size="sm" onClick={() => {
                setQ(""); setStatus("all"); setBuilderFilter("all"); setPlaceFilter("all");
                setTypeFilter("all"); setConstructionFilter("all"); setFeaturedFilter("all");
                setReraFilter("all"); setPossessionYearFilter("all"); setPage(1);
              }}>Clear filters</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {hasSelection ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => runBulkStatus("published")} disabled={bulkStatusMut.isPending}>Publish</Button>
            <Button size="sm" variant="outline" onClick={() => runBulkStatus("draft")} disabled={bulkStatusMut.isPending}>Draft</Button>
            <Button size="sm" variant="outline" onClick={() => runBulkStatus("archived")} disabled={bulkStatusMut.isPending}>Archive</Button>
            <Button size="sm" variant="outline" onClick={runBulkDuplicate} disabled={bulkDuplicateMut.isPending}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button size="sm" variant="outline" disabled title="Coming soon">Export</Button>
            <Button size="sm" variant="destructive" onClick={() => setPendingBulkDelete(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="p-8 text-center text-sm text-destructive">Failed to load projects.</div>
          ) : sorted.length === 0 ? (
            <EmptyState hasProjects={projects.length > 0} />
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
                    {visibleCols.has("hero") ? <TableHead className="w-16">Image</TableHead> : null}
                    {visibleCols.has("name") ? (
                      <TableHead>
                        <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>Project</SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("builder") ? <TableHead>Builder</TableHead> : null}
                    {visibleCols.has("place") ? <TableHead>Place</TableHead> : null}
                    {visibleCols.has("property_type") ? (
                      <TableHead>
                        <SortButton active={sortKey === "property_type"} dir={sortDir} onClick={() => toggleSort("property_type")}>Type</SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("construction") ? <TableHead>Construction</TableHead> : null}
                    {visibleCols.has("publish_status") ? (
                      <TableHead>
                        <SortButton active={sortKey === "publish_status"} dir={sortDir} onClick={() => toggleSort("publish_status")}>Status</SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("featured") ? <TableHead>Featured</TableHead> : null}
                    {visibleCols.has("rera") ? <TableHead>RERA</TableHead> : null}
                    {visibleCols.has("starting_price") ? (
                      <TableHead>
                        <SortButton active={sortKey === "starting_price"} dir={sortDir} onClick={() => toggleSort("starting_price")}>Starting</SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("possession") ? (
                      <TableHead>
                        <SortButton active={sortKey === "possession_date"} dir={sortDir} onClick={() => toggleSort("possession_date")}>Possession</SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("updated") ? (
                      <TableHead>
                        <SortButton active={sortKey === "updated_at"} dir={sortDir} onClick={() => toggleSort("updated_at")}>Updated</SortButton>
                      </TableHead>
                    ) : null}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((p) => {
                    const thumb = p.hero?.coverImageUrl || p.hero?.heroImageUrl;
                    return (
                      <TableRow key={p.id} data-selected={selected.has(p.id)}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(p.id)}
                            onCheckedChange={(v) => toggleRow(p.id, Boolean(v))}
                            aria-label={`Select ${p.name}`}
                          />
                        </TableCell>
                        {visibleCols.has("hero") ? (
                          <TableCell>
                            {thumb ? (
                              <img src={thumb} alt="" className="h-10 w-10 rounded-md border border-border object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-[10px] font-semibold uppercase text-muted-foreground">
                                {p.name.slice(0, 2)}
                              </div>
                            )}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("name") ? (
                          <TableCell>
                            <button
                              onClick={() => navigate({ to: "/admin/projects/$id", params: { id: p.id } })}
                              className="text-left font-medium text-foreground hover:text-accent"
                            >
                              {p.name}
                            </button>
                            <p className="text-xs text-muted-foreground">/{p.slug}</p>
                          </TableCell>
                        ) : null}
                        {visibleCols.has("builder") ? (
                          <TableCell className="text-sm">
                            {p.builder_id ? builderMap.get(p.builder_id) ?? "—" : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("place") ? (
                          <TableCell className="text-sm">
                            {p.place_id ? placeMap.get(p.place_id) ?? "—" : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("property_type") ? (
                          <TableCell className="text-sm">{p.property_type ?? "—"}</TableCell>
                        ) : null}
                        {visibleCols.has("construction") ? (
                          <TableCell>
                            <ConstructionCell status={p.construction_status} pct={p.completion_percentage} />
                          </TableCell>
                        ) : null}
                        {visibleCols.has("publish_status") ? (
                          <TableCell><StatusBadge status={p.publish_status ?? "draft"} /></TableCell>
                        ) : null}
                        {visibleCols.has("featured") ? (
                          <TableCell>{p.featured ? <Star className="h-4 w-4 fill-accent text-accent" /> : "—"}</TableCell>
                        ) : null}
                        {visibleCols.has("rera") ? (
                          <TableCell className="text-xs">
                            {p.rera_number ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                                <BadgeCheck className="h-3 w-3" /> {p.rera_number}
                              </span>
                            ) : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("starting_price") ? (
                          <TableCell className="text-sm">{formatINR(p.starting_price)}</TableCell>
                        ) : null}
                        {visibleCols.has("possession") ? (
                          <TableCell className="text-sm">
                            {p.possession_date ? new Date(p.possession_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("updated") ? (
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(p.updated_at).toLocaleDateString()}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <a
                              href={`/project/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                              aria-label={`Preview ${p.name}`}
                              title="Preview"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                try { await duplicateMut.mutateAsync(p.id); toast.success("Project duplicated"); }
                                catch (e) { toast.error((e as Error).message); }
                              }}
                              aria-label={`Duplicate ${p.name}`}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate({ to: "/admin/projects/$id", params: { id: p.id } })}
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
                    {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
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
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try { await deleteMut.mutateAsync(pendingDelete); toast.success("Project deleted"); }
                catch (e) { toast.error((e as Error).message); }
                finally { setPendingDelete(null); }
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
            <AlertDialogTitle>Delete {selectedIds.length} projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected projects. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await bulkDeleteMut.mutateAsync(selectedIds);
                  toast.success(`${selectedIds.length} projects deleted`);
                  setSelected(new Set());
                } catch (e) { toast.error((e as Error).message); }
                finally { setPendingBulkDelete(false); }
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

function ConstructionCell({
  status, pct,
}: { status: string | null; pct: number | null }) {
  if (!status && pct == null) return <span className="text-sm text-muted-foreground">—</span>;
  const p = Math.max(0, Math.min(100, Number(pct ?? 0)));
  return (
    <div className="min-w-[8rem] space-y-1">
      <div className="text-xs capitalize text-foreground">{status ?? "—"}</div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${p}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground">{p}%</div>
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
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
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function SortButton({
  active, dir, onClick, children,
}: {
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground">
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

function EmptyState({ hasProjects }: { hasProjects: boolean }) {
  return (
    <div className="p-12 text-center">
      <h3 className="text-base font-medium text-foreground">
        {hasProjects ? "No projects match your filters." : "No projects found."}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasProjects
          ? "Adjust the filters above or clear them to see everything."
          : "Create your first Project to start tracking property intelligence."}
      </p>
      {!hasProjects ? (
        <Link to="/admin/projects/new" className="mt-4 inline-block">
          <Button><Plus className="mr-2 h-4 w-4" /> Create first Project</Button>
        </Link>
      ) : null}
    </div>
  );
}
