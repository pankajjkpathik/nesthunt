import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid3x3, List, Trash2, Archive, FolderInput, Tag } from "lucide-react";
import { UploadQueue } from "@/components/admin/media/UploadQueue";
import { AssetCard } from "@/components/admin/media/AssetCard";
import { AssetDetails } from "@/components/admin/media/AssetDetails";
import {
  useBulkArchive,
  useBulkDeleteMedia,
  useBulkUpdateFolder,
  useBulkAddTags,
  useMediaAssets,
} from "@/hooks/useMedia";
import { FOLDERS } from "@/lib/services/media-admin";
import type { MediaAsset } from "@/lib/services/media";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/media/")({
  head: () => ({
    meta: [
      { title: "Media Library · NestHunt Admin" },
      { name: "description", content: "Centralized digital asset management for NestHunt." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <Library />
      </AdminShell>
    </AdminGuard>
  );
}

function Library() {
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [mimeGroup, setMimeGroup] = useState<"all" | "image" | "video" | "document">("all");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [largeOnly, setLargeOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [archivedOnly, setArchivedOnly] = useState(false);
  const [recentOnly, setRecentOnly] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Record<string, MediaAsset>>({});
  const [detail, setDetail] = useState<MediaAsset | null>(null);

  const filters = {
    search: search || undefined,
    folder,
    mimeGroup,
    unusedOnly,
    largeOnly,
    featuredOnly,
    archivedOnly,
    recentOnly,
    pageSize: 96,
  };
  const { data, isLoading } = useMediaAssets(filters);
  const assets = data?.data ?? [];

  const bulkDelete = useBulkDeleteMedia();
  const bulkFolder = useBulkUpdateFolder();
  const bulkArch = useBulkArchive();
  const bulkTags = useBulkAddTags();

  const selectedIds = useMemo(() => Object.keys(selected), [selected]);

  function toggle(a: MediaAsset) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[a.id]) delete next[a.id];
      else next[a.id] = a;
      return next;
    });
  }

  async function doBulkDelete() {
    if (!selectedIds.length) return;
    const usedCount = Object.values(selected).filter((a) => a.usageCount > 0).length;
    const msg = usedCount
      ? `${usedCount} of ${selectedIds.length} selected assets are in use. Delete anyway?`
      : `Delete ${selectedIds.length} asset(s)?`;
    if (!confirm(msg)) return;
    try {
      await bulkDelete.mutateAsync({ ids: selectedIds, force: usedCount > 0 });
      setSelected({});
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function doBulkFolder(f: string) {
    if (!selectedIds.length) return;
    await bulkFolder.mutateAsync({ ids: selectedIds, folder: f });
    toast.success(`Moved to ${f}`);
    setSelected({});
  }

  async function doBulkArchive() {
    if (!selectedIds.length) return;
    await bulkArch.mutateAsync({ ids: selectedIds, archived: !archivedOnly });
    toast.success(archivedOnly ? "Unarchived" : "Archived");
    setSelected({});
  }

  async function doBulkTag() {
    const raw = prompt("Add tags (comma-separated):");
    if (!raw) return;
    const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (!tags.length) return;
    await bulkTags.mutateAsync({ ids: selectedIds, tags });
    toast.success("Tags added");
    setSelected({});
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Central asset store — every module reads from here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-3 p-4">
          <UploadQueue />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by filename, tag, alt, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {FOLDERS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mimeGroup} onValueChange={(v) => setMimeGroup(v as typeof mimeGroup)}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <Checkbox checked={unusedOnly} onCheckedChange={(v) => setUnusedOnly(!!v)} />
              Unused
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={largeOnly} onCheckedChange={(v) => setLargeOnly(!!v)} />
              Large ({">"}2MB)
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={featuredOnly} onCheckedChange={(v) => setFeaturedOnly(!!v)} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={recentOnly} onCheckedChange={(v) => setRecentOnly(!!v)} />
              Recent (7d)
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={archivedOnly} onCheckedChange={(v) => setArchivedOnly(!!v)} />
              Archived
            </label>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          <span className="font-medium">{selectedIds.length} selected</span>
          <Select onValueChange={doBulkFolder}>
            <SelectTrigger className="h-8 w-40">
              <FolderInput className="mr-1 h-3 w-3" />
              <SelectValue placeholder="Move to folder" />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={doBulkTag}>
            <Tag className="mr-1 h-3 w-3" />
            Tag
          </Button>
          <Button size="sm" variant="outline" onClick={doBulkArchive}>
            <Archive className="mr-1 h-3 w-3" />
            {archivedOnly ? "Unarchive" : "Archive"}
          </Button>
          <Button size="sm" variant="destructive" onClick={doBulkDelete}>
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected({})}>
            Clear
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : assets.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No assets match your filters.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {assets.map((a) => (
            <AssetCard
              key={a.id}
              asset={a}
              selected={!!selected[a.id]}
              onOpen={() => setDetail(a)}
              onToggleSelect={() => toggle(a)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="w-8 px-2 py-2"></th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Folder</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-right">Size</th>
                <th className="px-2 py-2 text-right">Uses</th>
                <th className="px-2 py-2 text-left">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr
                  key={a.id}
                  className={cn(
                    "border-t border-border hover:bg-muted/30",
                    selected[a.id] && "bg-accent/5",
                  )}
                >
                  <td className="px-2 py-1">
                    <Checkbox
                      checked={!!selected[a.id]}
                      onCheckedChange={() => toggle(a)}
                    />
                  </td>
                  <td
                    className="cursor-pointer px-2 py-1 font-medium"
                    onClick={() => setDetail(a)}
                  >
                    {a.fileName}
                  </td>
                  <td className="px-2 py-1 text-muted-foreground">{a.folder}</td>
                  <td className="px-2 py-1 text-muted-foreground">{a.mimeType}</td>
                  <td className="px-2 py-1 text-right">{(a.fileSize / 1024).toFixed(0)} KB</td>
                  <td className="px-2 py-1 text-right">{a.usageCount}</td>
                  <td className="px-2 py-1 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssetDetails asset={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  );
}
