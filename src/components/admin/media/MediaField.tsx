import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import { getPublicUrl } from "@/lib/services/media";
import type { Folder } from "@/lib/services/media-admin";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder?: Folder;
  accept?: string;
}

export function MediaField({ label, value, onChange, folder, accept }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Label className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-10 w-10 rounded border border-border object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pick from library or paste URL"
          className="h-9 flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          Library
        </Button>
        {value ? (
          <Button type="button" size="icon" variant="ghost" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple={false}
        folder={folder}
        accept={accept}
        onSelect={(assets) => {
          if (assets[0]) onChange(getPublicUrl(assets[0].storagePath));
        }}
      />
    </div>
  );
}

interface MultiProps {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  folder?: Folder;
}

export function MediaGalleryField({ label, values, onChange, folder }: MultiProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          Add from library
        </Button>
      </div>
      {values.length === 0 ? (
        <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No images yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {values.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 shadow group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple
        folder={folder}
        onSelect={(assets) => onChange([...values, ...assets.map((a) => getPublicUrl(a.storagePath))])}
      />
    </div>
  );
}
