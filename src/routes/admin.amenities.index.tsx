import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Copy, Star } from "lucide-react";
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
  useAmenities,
  useAmenityUsageCounts,
  useBulkAmenityStatus,
  useBulkDeleteAmenities,
  useDeleteAmenity,
  useDuplicateAmenity,
  useToggleAmenityFeatured,
} from "@/hooks/useAmenities";
import { AMENITY_CATEGORIES } from "@/types/content";

export const Route = createFileRoute("/admin/amenities/")({
  component: AmenitiesList,
});

function AmenitiesList() {
  const { data = [], isLoading } = useAmenities();
  const { data: usage } = useAmenityUsageCounts();
  const del = useDeleteAmenity();
  const dup = useDuplicateAmenity();
  const feat = useToggleAmenityFeatured();
  const bulkStatus = useBulkAmenityStatus();
  const bulkDelete = useBulkDeleteAmenities();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => (cat === "all" ? true : a.category === cat))
      .filter((a) =>
        !term
          ? true
          : a.name.toLowerCase().includes(term) || a.slug.toLowerCase().includes(term),
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
      title="Amenities"
      description="Reusable amenities attached to projects and places."
      newHref="/admin/amenities/new"
      newLabel="New amenity"
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
            {AMENITY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
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
              variant="outline"
              onClick={async () => {
                await bulkStatus.mutateAsync({ ids: [...selected], status: "draft" });
                toast.success("Moved to draft");
                setSelected(new Set());
              }}
            >
              Draft
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
              <TableHead>Slug</TableHead>
              <TableHead>Featured</TableHead>
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
                  No amenities yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(a.id)}
                      onCheckedChange={(v) => toggle(a.id, Boolean(v))}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        navigate({ to: "/admin/amenities/$id", params: { id: a.id } })
                      }
                      className="text-left font-medium text-foreground hover:text-accent"
                    >
                      {a.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {a.category ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">/{a.slug}</TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        feat.mutate({ id: a.id, featured: !a.featured })
                      }
                      title="Toggle featured"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          a.featured ? "fill-accent text-accent" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{usage?.get(a.id) ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {a.status}
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
                          <Link to="/admin/amenities/$id" params={{ id: a.id }}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await dup.mutateAsync(a.id);
                              toast.success("Duplicated");
                            } catch (e) {
                              toast.error((e as Error).message);
                            }
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={async () => {
                            try {
                              await del.mutateAsync(a.id);
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
