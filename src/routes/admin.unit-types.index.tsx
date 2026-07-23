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
import { ContentListShell } from "@/components/admin/content/ContentListShell";
import {
  useBulkDeleteUnitTypes,
  useBulkUnitTypeStatus,
  useDeleteUnitType,
  useUnitTypeUsageCounts,
  useUnitTypes,
} from "@/hooks/useUnitTypes";

export const Route = createFileRoute("/admin/unit-types/")({
  component: UnitTypesList,
});

function UnitTypesList() {
  const { data = [], isLoading } = useUnitTypes();
  const { data: usage } = useUnitTypeUsageCounts();
  const del = useDeleteUnitType();
  const bulkStatus = useBulkUnitTypeStatus();
  const bulkDelete = useBulkDeleteUnitTypes();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter((u) => (status === "all" ? true : u.status === status))
      .filter((u) =>
        !term ? true : u.name.toLowerCase().includes(term) || u.slug.toLowerCase().includes(term),
      );
  }, [data, q, status]);

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
      title="Unit Types"
      description="Reusable unit templates attached to projects."
      newHref="/admin/unit-types/new"
      newLabel="New unit type"
      query={q}
      onQueryChange={setQ}
      status={status}
      onStatusChange={setStatus}
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
              <TableHead>Configuration</TableHead>
              <TableHead>Area (sqft)</TableHead>
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
                  No unit types yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={(v) => toggle(u.id, Boolean(v))}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        navigate({ to: "/admin/unit-types/$id", params: { id: u.id } })
                      }
                      className="text-left font-medium text-foreground hover:text-accent"
                    >
                      {u.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {u.category}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[
                      u.bedrooms != null ? `${u.bedrooms} BHK` : null,
                      u.bathrooms != null ? `${u.bathrooms} Bath` : null,
                      u.balconies != null ? `${u.balconies} Bal` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.super_area_min && u.super_area_max
                      ? `${u.super_area_min}–${u.super_area_max}`
                      : u.super_area_min || u.super_area_max || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{usage?.get(u.id) ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {u.status}
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
                          <Link to="/admin/unit-types/$id" params={{ id: u.id }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            try {
                              await del.mutateAsync(u.id);
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
