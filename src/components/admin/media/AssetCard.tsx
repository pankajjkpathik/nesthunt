import { cn } from "@/lib/utils";
import { getPublicUrl, type MediaAsset } from "@/lib/services/media";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, FileVideo, Image as ImageIcon, Star, Archive } from "lucide-react";

interface Props {
  asset: MediaAsset;
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
  onToggleSelect?: () => void;
  showCheckbox?: boolean;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function AssetCard({
  asset,
  selected,
  onOpen,
  onToggleSelect,
  showCheckbox = true,
}: Props) {
  const isImage = asset.mimeType.startsWith("image/");
  const isVideo = asset.mimeType.startsWith("video/");
  const url = getPublicUrl(asset.storagePath);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border bg-surface text-left transition-colors",
        selected ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent/50",
      )}
    >
      {showCheckbox && (
        <div className="absolute left-2 top-2 z-10 rounded bg-background/80 p-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 data-[on=true]:opacity-100" data-on={selected}>
          <Checkbox checked={!!selected} onCheckedChange={() => onToggleSelect?.()} />
        </div>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="flex aspect-square w-full items-center justify-center bg-muted/40"
      >
        {isImage ? (
          <img
            src={url}
            alt={asset.alt || asset.fileName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : isVideo ? (
          <FileVideo className="h-10 w-10 text-muted-foreground" />
        ) : asset.mimeType === "application/pdf" ? (
          <FileText className="h-10 w-10 text-muted-foreground" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        )}
      </button>
      <div className="flex flex-col gap-1 p-2 text-xs">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate font-medium" title={asset.fileName}>
            {asset.fileName}
          </span>
          <div className="flex items-center gap-0.5 text-muted-foreground">
            {asset.featured && <Star className="h-3 w-3 fill-accent text-accent" />}
            {asset.archived && <Archive className="h-3 w-3" />}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{formatBytes(asset.fileSize)}</span>
          {asset.width && asset.height && (
            <span>
              {asset.width}×{asset.height}
            </span>
          )}
          <span
            className={cn(
              "rounded px-1",
              asset.usageCount > 0 ? "bg-success/10 text-success" : "bg-muted",
            )}
          >
            {asset.usageCount} use{asset.usageCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
