import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentListShell } from "@/components/admin/content/ContentListShell";
import {
  useBulkDeleteInfrastructure,
  useBulkInfrastructureStatus,
  useDeleteInfrastructure,
  useInfrastructure,
  useInfrastructureUsageCounts,
} from "@/hooks/useInfrastructure";
import { INFRASTRUCTURE_CATEGORIES } from "@/types/content";

export const Route = createFileRoute("/admin/infrastructure/")({
  component: InfrastructureList,
});

function InfrastructureList() {
  const { data = [], isLoading } = useInfrastructure();
  const { data: usage } = useInfrastructureUsageCounts();
  const del = useDeleteInfrastructure();
  const bulkStatus = useBulkInfrastructureStatus();
  const bulkDelete = useBulkDeleteInfrastructure();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter((i) => (status === "all" ? true : i.status === status))
      .filter((i) => (cat === "all" ? true : i.category === cat))
      .filter((i) =>
        !term
          ? true
          : i.name.toLowerCase().includes(term) ||
            i.slug.toLowerCase().includes(term) ||
            (i.city ?? "").toLowerCase().includes(term),
      );
  }, [data, q, status, cat]);

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <ContentListShell
      title="Nearby Infrastructure"
      description="Central database of hospitals, schools, transit, and more."
      newHref="/admin/infrastructure/new"
      newLabel="New item"
      query={q}
      onQueryChange={setQ}
      status={status}
      onStatusChange={setStatus}
      extraFilters={
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {INFRASTRUCTURE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      bulkActions={
        selected.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await bulkStatus.mutateAsync({ ids: [...selected], status: "published" });
                toast.success("Published");
                setSelected(new Set());
              }}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                await bulkDelete.mutateAsync([...selected]);
                toast.success("Deleted");
                setSelected(new Set());
              }}
            >
              Delete
            </Button>
          </div>
        ) : null
      }
    >
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No infrastructure items yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(i.id)}
                      onCheckedChange={(v) => toggle(i.id, Boolean(v))}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        navigate({ to: "/admin/infrastructure/$id", params: { id: i.id } })
                      }
                      className="text-left font-medium text-foreground hover:text-accent"
                    >
                      {i.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {(i.category ?? "").replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[i.city, i.state].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {i.latitude != null && i.longitude != null
                      ? `${i.latitude.toFixed(4)}, ${i.longitude.toFixed(4)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{usage?.get(i.id) ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/admin/infrastructure/$id" params={{ id: i.id }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            try {
                              await del.mutateAsync(i.id);
                              toast.success("Deleted");
                            } catch (e) {
                              toast.error((e as Error).message);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ContentListShell>
  );
}
