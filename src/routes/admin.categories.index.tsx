import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Copy, ChevronRight } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentListShell } from "@/components/admin/content/ContentListShell";
import {
  useBulkCategoryStatus,
  useBulkDeleteCategories,
  useCategories,
  useCategoryUsageCounts,
  useDeleteCategory,
  useDuplicateCategory,
} from "@/hooks/useCategories";

export const Route = createFileRoute("/admin/categories/")({
  component: CategoriesList,
});

function CategoriesList() {
  const { data = [], isLoading } = useCategories();
  const { data: usage } = useCategoryUsageCounts();
  const del = useDeleteCategory();
  const dup = useDuplicateCategory();
  const bulkStatus = useBulkCategoryStatus();
  const bulkDelete = useBulkDeleteCategories();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; used: number } | null>(null);

  const nameById = useMemo(() => new Map(data.map((c) => [c.id, c.name])), [data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) =>
        !term
          ? true
          : c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term),
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

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await del.mutateAsync(pendingDelete.id);
      toast.success("Category deleted");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <ContentListShell
      title="Categories"
      description="Reusable classifications for places, builders, and projects."
      newHref="/admin/categories/new"
      newLabel="New category"
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
              <TableHead>Parent</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => {
                const used = usage?.get(c.id) ?? 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={(v) => toggle(c.id, Boolean(v))}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate({ to: "/admin/categories/$id", params: { id: c.id } })}
                        className="text-left font-medium text-foreground hover:text-accent"
                      >
                        {c.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.parent_id ? (
                        <span className="inline-flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {nameById.get(c.parent_id) ?? "—"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">/{c.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{used}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/categories/$id" params={{ id: c.id }}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await dup.mutateAsync(c.id);
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
                            onClick={() => setPendingDelete({ id: c.id, name: c.name, used })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {(pendingDelete?.used ?? 0) > 0
                ? `This category is used ${pendingDelete?.used} time(s). Deleting will detach it from those entities.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentListShell>
  );
}
