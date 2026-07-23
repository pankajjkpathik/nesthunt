import { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  busy?: boolean;
  hint?: string;
  className?: string;
}

export function DropZone({ onFiles, accept, multiple = true, busy, hint, className }: Props) {
  const [drag, setDrag] = useState(false);

  const handle = useCallback(
    (files: FileList | null) => {
      if (!files || !files.length) return;
      onFiles(Array.from(files));
    },
    [onFiles],
  );

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-sm text-muted-foreground transition-colors hover:bg-muted/40",
        drag && "border-accent bg-accent/10 text-foreground",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
      <span className="font-medium">
        {busy ? "Uploading…" : "Drop files here or click to browse"}
      </span>
      {hint && <span className="text-xs">{hint}</span>}
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}
