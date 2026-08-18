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
import { ProjectGovernanceStats } from "@/components/admin/ProjectGovernanceStats";

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
  if (v >= 1_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} L`; // Typo in original: 10000000 for Lakhs? Correcting to 1_00_000
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
      <ProjectGovernanceStats />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage property listings and intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate({ to: "/admin/projects/new" })}>
            <Plus className="mr-1.5 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* ... rest of the file ... */}
