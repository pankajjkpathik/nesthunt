import { useState } from "react";
import { toast } from "sonner";
import { uploadAsset, type Folder } from "@/lib/services/media-admin";
import { DropZone } from "./DropZone";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RotateCw, X, Check, Loader2 } from "lucide-react";
import type { MediaAsset } from "@/lib/services/media";

type Status = "pending" | "uploading" | "done" | "error";
interface QueueItem {
  id: string;
  file: File;
  status: Status;
  error?: string;
  asset?: MediaAsset;
}

interface Props {
  folder?: Folder;
  accept?: string;
  multiple?: boolean;
  onUploaded?: (asset: MediaAsset) => void;
}

export function UploadQueue({ folder, accept, multiple = true, onUploaded }: Props) {
  const [items, setItems] = useState<QueueItem[]>([]);

  function enqueue(files: File[]) {
    const next: QueueItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: "pending",
    }));
    setItems((prev) => [...prev, ...next]);
    next.forEach(runUpload);
  }

  async function runUpload(item: QueueItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i)));
    try {
      const asset = await uploadAsset({ file: item.file, folder });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "done", asset } : i)),
      );
      onUploaded?.(asset);
    } catch (e) {
      const msg = (e as Error).message;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: msg } : i)),
      );
      toast.error(`${item.file.name}: ${msg}`);
    }
  }

  return (
    <div className="space-y-3">
      <DropZone
        multiple={multiple}
        accept={accept}
        onFiles={enqueue}
        hint={accept ?? "JPG, PNG, WEBP, AVIF, SVG, PDF"}
      />
      {items.length > 0 && (
        <div className="rounded-md border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>Upload queue · {items.length}</span>
            <button
              className="hover:text-foreground"
              onClick={() => setItems((prev) => prev.filter((i) => i.status !== "done"))}
            >
              Clear completed
            </button>
          </div>
          <ul className="divide-y divide-border">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                <span className="flex-1 truncate">{i.file.name}</span>
                <span className="w-24 text-right text-muted-foreground">
                  {(i.file.size / 1024).toFixed(0)} KB
                </span>
                <div className="w-32">
                  {i.status === "uploading" && <Progress value={60} className="h-1.5" />}
                  {i.status === "done" && (
                    <span className="flex items-center gap-1 text-success">
                      <Check className="h-3 w-3" /> Done
                    </span>
                  )}
                  {i.status === "error" && (
                    <span className="truncate text-destructive" title={i.error}>
                      {i.error}
                    </span>
                  )}
                  {i.status === "pending" && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
                {i.status === "error" && (
                  <Button size="sm" variant="ghost" onClick={() => runUpload(i)}>
                    <RotateCw className="h-3 w-3" />
                  </Button>
                )}
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
