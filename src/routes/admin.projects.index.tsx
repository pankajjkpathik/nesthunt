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
import { Badge } from "@/components/ui/badge";

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
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (term) {
        const hay = `${p.name} ${p.slug} ${p.rera_number ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [projects, q]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = sortKey === "name" ? a.name.toLowerCase() : a.updated_at;
      const vb = sortKey === "name" ? b.name.toLowerCase() : b.updated_at;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <ProjectGovernanceStats />
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage property listings and intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/projects/intake" })}>
            <Plus className="mr-1.5 h-4 w-4" /> Batch Intake
          </Button>
          <Button size="sm" onClick={() => navigate({ to: "/admin/projects/new" })}>
            <Plus className="mr-1.5 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.publish_status === "published" ? "default" : "secondary"}>
                      {p.publish_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatINR(p.starting_price)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/projects/$id", params: { id: p.id } })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
