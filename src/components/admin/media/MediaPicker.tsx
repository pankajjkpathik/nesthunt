import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { AssetCard } from "./AssetCard";
import { UploadQueue } from "./UploadQueue";
import { useMediaAssets } from "@/hooks/useMedia";
import type { MediaAsset } from "@/lib/services/media";
import { FOLDERS, type Folder } from "@/lib/services/media-admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  multiple?: boolean;
  accept?: string;
  folder?: Folder;
  title?: string;
}

export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  accept,
  folder,
  title = "Choose media",
}: Props) {
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState<string>(folder ?? "all");
  const [mimeGroup, setMimeGroup] = useState<"all" | "image" | "video" | "document">(
    accept?.includes("pdf") ? "document" : "image",
  );
  const [selected, setSelected] = useState<Record<string, MediaAsset>>({});

  const { data, isLoading } = useMediaAssets({
    search: search || undefined,
    folder: folderFilter,
    mimeGroup,
    pageSize: 60,
  });

  function toggle(a: MediaAsset) {
    if (!multiple) {
      setSelected({ [a.id]: a });
      return;
    }
    setSelected((prev) => {
      const next = { ...prev };
      if (next[a.id]) delete next[a.id];
      else next[a.id] = a;
      return next;
    });
  }

  function confirm() {
    onSelect(Object.values(selected));
    setSelected({});
    onClose();
  }

  const chosen = useMemo(() => Object.values(selected), [selected]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <UploadQueue
            folder={folder}
            accept={accept}
            onUploaded={(a) => {
              // auto-select newly uploaded
              setSelected((prev) => (multiple ? { ...prev, [a.id]: a } : { [a.id]: a }));
            }}
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
            <Select value={folderFilter} onValueChange={setFolderFilter}>
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
              <SelectTrigger className="h-9 w-32">
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

          <div className="max-h-[50vh] overflow-y-auto rounded-md border border-border p-2">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : !data || data.data.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No assets. Upload above to add some.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {data.data.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    selected={!!selected[a.id]}
                    onOpen={() => toggle(a)}
                    onToggleSelect={() => toggle(a)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {chosen.length} selected{multiple ? "" : chosen.length ? " (single)" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={chosen.length === 0}>
                Use selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
