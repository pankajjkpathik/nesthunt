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
  useAdminBuilders,
  useBulkDeleteBuilders,
  useBulkUpdateBuilderStatus,
  useBulkVerifyBuilders,
  useDeleteBuilder,
  useDuplicateBuilder,
} from "@/hooks/useAdminBuilders";
import type { BuilderHero, BuilderRow, BuilderStatus } from "@/lib/services/builders-admin";

export const Route = createFileRoute("/admin/builders/")({
  component: BuildersList,
});

type SortKey = "name" | "state" | "city" | "status" | "trust_score" | "updated_at";
type SortDir = "asc" | "desc";

const ALL_COLUMNS = [
  { key: "logo", label: "Logo" },
  { key: "name", label: "Name" },
  { key: "headquarters", label: "Headquarters" },
  { key: "trust_score", label: "Trust Score" },
  { key: "status", label: "Status" },
  { key: "verified", label: "Verified" },
  { key: "featured", label: "Featured" },
  { key: "updated", label: "Updated" },
] as const;
type ColumnKey = (typeof ALL_COLUMNS)[number]["key"];

const PAGE_SIZES = [10, 25, 50, 100];

function BuildersList() {
  const { data: builders = [], isLoading, error } = useAdminBuilders();
  const deleteMut = useDeleteBuilder();
  const duplicateMut = useDuplicateBuilder();
  const bulkStatusMut = useBulkUpdateBuilderStatus();
  const bulkVerifyMut = useBulkVerifyBuilders();
  const bulkDeleteMut = useBulkDeleteBuilders();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [trustFilter, setTrustFilter] = useState<string>("all");
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
    () => Array.from(new Set(builders.map((b) => b.state).filter(Boolean))).sort(),
    [builders],
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(builders.map((b) => b.city).filter(Boolean))).sort(),
    [builders],
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(builders.map((b) => b.builder_type).filter(Boolean))).sort(),
    [builders],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return builders.filter((b) => {
      if (status !== "all" && (b.status ?? "draft") !== status) return false;
      if (stateFilter !== "all" && b.state !== stateFilter) return false;
      if (cityFilter !== "all" && b.city !== cityFilter) return false;
      if (typeFilter !== "all" && b.builder_type !== typeFilter) return false;
      if (featuredFilter === "featured" && !b.featured) return false;
      if (featuredFilter === "not-featured" && b.featured) return false;
      if (verifiedFilter === "verified" && !b.verified) return false;
      if (verifiedFilter === "not-verified" && b.verified) return false;
      if (trustFilter !== "all") {
        const ts = Number(b.trust_score ?? 0);
        if (trustFilter === "gte9" && ts < 9) return false;
        if (trustFilter === "gte8" && ts < 8) return false;
        if (trustFilter === "gte7" && ts < 7) return false;
        if (trustFilter === "lt7" && ts >= 7) return false;
      }
      if (term) {
        const rera = (b.rera ?? [])
          .map((r) => r.registration ?? "")
          .join(" ")
          .toLowerCase();
        const hay =
          `${b.name} ${b.slug} ${b.city ?? ""} ${b.state ?? ""} ${b.headquarters ?? ""} ${rera}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [builders, q, status, stateFilter, cityFilter, typeFilter, featuredFilter, verifiedFilter, trustFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va =
        sortKey === "name" ? a.name.toLowerCase()
        : sortKey === "state" ? (a.state ?? "").toLowerCase()
        : sortKey === "city" ? (a.city ?? "").toLowerCase()
        : sortKey === "status" ? (a.status ?? "").toLowerCase()
        : sortKey === "trust_score" ? Number(a.trust_score ?? 0)
        : a.updated_at;
      const vb =
        sortKey === "name" ? b.name.toLowerCase()
        : sortKey === "state" ? (b.state ?? "").toLowerCase()
        : sortKey === "city" ? (b.city ?? "").toLowerCase()
        : sortKey === "status" ? (b.status ?? "").toLowerCase()
        : sortKey === "trust_score" ? Number(b.trust_score ?? 0)
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

  async function runBulkStatus(next: BuilderStatus) {
    try {
      await bulkStatusMut.mutateAsync({ ids: selectedIds, status: next });
      toast.success(`${selectedIds.length} builder${selectedIds.length === 1 ? "" : "s"} updated`);
      setSelected(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function runBulkVerify(verified: boolean) {
    try {
      await bulkVerifyMut.mutateAsync({ ids: selectedIds, verified });
      toast.success(`${selectedIds.length} builder${selectedIds.length === 1 ? "" : "s"} ${verified ? "verified" : "unverified"}`);
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
      toast.success(`Duplicated ${ok} builder${ok === 1 ? "" : "s"}`);
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
    typeFilter !== "all" ||
    featuredFilter !== "all" ||
    verifiedFilter !== "all" ||
    trustFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Builders</h1>
          <p className="text-sm text-muted-foreground">
            {builders.length} builder{builders.length === 1 ? "" : "s"} in the system.
          </p>
        </div>
        <Link to="/admin/builders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Builder
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
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search name, slug, city, state, RERA…"
                className="pl-9"
                aria-label="Search builders"
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
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v); setPage(1); }}
              placeholder="Type"
              options={[{ value: "all", label: "All types" }, ...typeOptions.map((s) => ({ value: s!, label: s! }))]}
            />
            <FilterSelect
              value={trustFilter}
              onChange={(v) => { setTrustFilter(v); setPage(1); }}
              placeholder="Trust score"
              options={[
                { value: "all", label: "Any score" },
                { value: "gte9", label: "≥ 9.0" },
                { value: "gte8", label: "≥ 8.0" },
                { value: "gte7", label: "≥ 7.0" },
                { value: "lt7", label: "< 7.0" },
              ]}
            />
            <FilterSelect
              value={verifiedFilter}
              onChange={(v) => { setVerifiedFilter(v); setPage(1); }}
              placeholder="Verified"
              options={[
                { value: "all", label: "All" },
                { value: "verified", label: "Verified only" },
                { value: "not-verified", label: "Not verified" },
              ]}
            />
            <FilterSelect
              value={featuredFilter}
              onChange={(v) => { setFeaturedFilter(v); setPage(1); }}
              placeholder="Featured"
              options={[
                { value: "all", label: "All builders" },
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
                  setStatus("all"); setStateFilter("all"); setCityFilter("all");
                  setTypeFilter("all"); setFeaturedFilter("all"); setVerifiedFilter("all"); setTrustFilter("all");
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
            <Button size="sm" variant="outline" onClick={() => runBulkVerify(true)} disabled={bulkVerifyMut.isPending}>
              <BadgeCheck className="mr-1.5 h-3.5 w-3.5" /> Verify
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
            <div className="p-8 text-center text-sm text-destructive">Failed to load builders.</div>
          ) : sorted.length === 0 ? (
            <EmptyState hasBuilders={builders.length > 0} />
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
                    {visibleCols.has("logo") ? <TableHead className="w-16">Logo</TableHead> : null}
                    {visibleCols.has("name") ? (
                      <TableHead>
                        <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>
                          Builder
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("headquarters") ? (
                      <TableHead>
                        <SortButton active={sortKey === "city"} dir={sortDir} onClick={() => toggleSort("city")}>
                          Headquarters
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("trust_score") ? (
                      <TableHead>
                        <SortButton active={sortKey === "trust_score"} dir={sortDir} onClick={() => toggleSort("trust_score")}>
                          Trust
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("status") ? (
                      <TableHead>
                        <SortButton active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")}>
                          Status
                        </SortButton>
                      </TableHead>
                    ) : null}
                    {visibleCols.has("verified") ? <TableHead>Verified</TableHead> : null}
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
                  {pageRows.map((b) => {
                    const hero = (b.hero ?? {}) as BuilderHero;
                    const logo = hero.logoUrl || hero.coverImageUrl;
                    const hq = b.headquarters || [b.city, b.state].filter(Boolean).join(", ");
                    return (
                      <TableRow key={b.id} data-selected={selected.has(b.id)}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(b.id)}
                            onCheckedChange={(v) => toggleRow(b.id, Boolean(v))}
                            aria-label={`Select ${b.name}`}
                          />
                        </TableCell>
                        {visibleCols.has("logo") ? (
                          <TableCell>
                            {logo ? (
                              <img src={logo} alt="" className="h-10 w-10 rounded-md border border-border object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-[10px] font-semibold uppercase text-muted-foreground">
                                {b.name.slice(0, 2)}
                              </div>
                            )}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("name") ? (
                          <TableCell>
                            <button
                              onClick={() => navigate({ to: "/admin/builders/$id", params: { id: b.id } })}
                              className="text-left font-medium text-foreground hover:text-accent"
                            >
                              {b.name}
                            </button>
                            <p className="text-xs text-muted-foreground">/{b.slug}</p>
                          </TableCell>
                        ) : null}
                        {visibleCols.has("headquarters") ? (
                          <TableCell className="text-sm">{hq || "—"}</TableCell>
                        ) : null}
                        {visibleCols.has("trust_score") ? (
                          <TableCell className="text-sm">
                            {b.trust_score != null ? (
                              <span className="font-medium">{Number(b.trust_score).toFixed(1)}</span>
                            ) : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("status") ? (
                          <TableCell><StatusBadge status={b.status ?? "draft"} /></TableCell>
                        ) : null}
                        {visibleCols.has("verified") ? (
                          <TableCell>
                            {b.verified ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                                <BadgeCheck className="h-3 w-3" /> Verified
                              </span>
                            ) : "—"}
                          </TableCell>
                        ) : null}
                        {visibleCols.has("featured") ? (
                          <TableCell className="text-xs">{b.featured ? "★" : "—"}</TableCell>
                        ) : null}
                        {visibleCols.has("updated") ? (
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(b.updated_at).toLocaleDateString()}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <a
                              href={`/builder/${b.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                              aria-label={`Preview ${b.name}`}
                              title="Preview"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                try {
                                  await duplicateMut.mutateAsync(b.id);
                                  toast.success("Builder duplicated");
                                } catch (e) {
                                  toast.error((e as Error).message);
                                }
                              }}
                              aria-label={`Duplicate ${b.name}`}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate({ to: "/admin/builders/$id", params: { id: b.id } })}
                              aria-label={`Edit ${b.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPendingDelete(b.id)}
                              aria-label={`Delete ${b.name}`}
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
            <AlertDialogTitle>Delete this builder?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the builder. Linked projects will remain but lose the builder reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingDelete) return;
                try {
                  await deleteMut.mutateAsync(pendingDelete);
                  toast.success("Builder deleted");
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
            <AlertDialogTitle>Delete {selectedIds.length} builders?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected builders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await bulkDeleteMut.mutateAsync(selectedIds);
                  toast.success(`${selectedIds.length} builders deleted`);
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
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
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

function EmptyState({ hasBuilders }: { hasBuilders: boolean }) {
  return (
    <div className="p-12 text-center">
      <h3 className="text-base font-medium text-foreground">
        {hasBuilders ? "No builders match your filters." : "No builders found."}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasBuilders
          ? "Adjust the filters above or clear them to see everything."
          : "Create your first Builder to start tracking developer intelligence."}
      </p>
      {!hasBuilders ? (
        <Link to="/admin/builders/new" className="mt-4 inline-block">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create first Builder
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
