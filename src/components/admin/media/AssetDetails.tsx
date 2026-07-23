import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { getPublicUrl, type MediaAsset } from "@/lib/services/media";
import {
  useAssetUsages,
  useDeleteMedia,
  useReplaceMedia,
  useUpdateMediaMetadata,
} from "@/hooks/useMedia";
import { FOLDERS } from "@/lib/services/media-admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  asset: MediaAsset | null;
  open: boolean;
  onClose: () => void;
}

export function AssetDetails({ asset, open, onClose }: Props) {
  const update = useUpdateMediaMetadata();
  const replace = useReplaceMedia();
  const del = useDeleteMedia();
  const usages = useAssetUsages(asset?.id);

  const [form, setForm] = useState<Partial<MediaAsset>>({});
  useEffect(() => {
    if (asset) setForm(asset);
  }, [asset?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!asset) return null;
  const url = getPublicUrl(asset.storagePath);

  async function save() {
    if (!asset) return;
    await update.mutateAsync({
      id: asset.id,
      patch: {
        alt: form.alt,
        title: form.title,
        caption: form.caption,
        description: form.description,
        credit: form.credit,
        photographer: form.photographer,
        license: form.license,
        copyright: form.copyright,
        tags: form.tags,
        folder: form.folder,
        featured: form.featured,
        archived: form.archived,
      },
    });
    toast.success("Metadata saved");
  }

  async function onReplace(file: File) {
    if (!asset) return;
    await replace.mutateAsync({ id: asset.id, file });
    toast.success("Asset replaced. All references now serve the new file.");
  }

  async function onDelete() {
    if (!asset) return;
    const force =
      asset.usageCount > 0
        ? confirm(
            `This asset is used in ${asset.usageCount} place(s). Delete anyway? Existing references will break.`,
          )
        : true;
    if (!force) return;
    try {
      await del.mutateAsync({ id: asset.id, force: asset.usageCount > 0 });
      toast.success("Deleted");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="truncate">{asset.fileName}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-md border border-border bg-muted/20">
            {asset.mimeType.startsWith("image/") ? (
              <img src={url} alt={asset.alt} className="mx-auto max-h-72 object-contain" />
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {asset.mimeType}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Info label="Size" value={`${(asset.fileSize / 1024).toFixed(0)} KB`} />
            <Info
              label="Dimensions"
              value={asset.width ? `${asset.width}×${asset.height}` : "—"}
            />
            <Info label="Type" value={asset.mimeType} />
            <Info label="Uploaded" value={new Date(asset.createdAt).toLocaleDateString()} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("URL copied");
              }}
            >
              <Copy className="mr-1 h-3 w-3" /> Copy URL
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={url} download={asset.fileName}>
                <Download className="mr-1 h-3 w-3" /> Download
              </a>
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-muted">
              {replace.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Replace
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onReplace(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-1 h-3 w-3" /> Delete
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Field label="Alt text" value={form.alt ?? ""} onChange={(v) => setForm({ ...form, alt: v })} />
            <Field label="Title" value={form.title ?? ""} onChange={(v) => setForm({ ...form, title: v })} />
            <TextAreaField
              label="Caption"
              value={form.caption ?? ""}
              onChange={(v) => setForm({ ...form, caption: v })}
            />
            <TextAreaField
              label="Description"
              value={form.description ?? ""}
              onChange={(v) => setForm({ ...form, description: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Credit" value={form.credit ?? ""} onChange={(v) => setForm({ ...form, credit: v })} />
              <Field label="Photographer" value={form.photographer ?? ""} onChange={(v) => setForm({ ...form, photographer: v })} />
              <Field label="License" value={form.license ?? ""} onChange={(v) => setForm({ ...form, license: v })} />
              <Field label="Copyright" value={form.copyright ?? ""} onChange={(v) => setForm({ ...form, copyright: v })} />
            </div>
            <div>
              <Label className="text-xs">Tags (comma-separated)</Label>
              <Input
                value={(form.tags ?? []).join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Folder</Label>
              <Select
                value={form.folder ?? "uncategorized"}
                onValueChange={(v) => setForm({ ...form, folder: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLDERS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6 pt-1 text-sm">
              <label className="flex items-center gap-2">
                <Switch
                  checked={!!form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={!!form.archived}
                  onCheckedChange={(v) => setForm({ ...form, archived: v })}
                />
                Archived
              </label>
            </div>
            <Button size="sm" onClick={save} disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save metadata"}
            </Button>
          </div>

          <Separator />
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Linked entities ({usages.data?.length ?? 0})
            </div>
            {usages.data && usages.data.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {usages.data.map((u) => (
                  <li key={u.id} className="flex items-center justify-between rounded border border-border bg-muted/20 px-2 py-1">
                    <span>
                      <Badge variant="outline" className="mr-2 uppercase">
                        {u.entityType}
                      </Badge>
                      <span className="text-muted-foreground">{u.field}</span>
                    </span>
                    <span className="truncate font-mono text-[10px] text-muted-foreground">
                      {u.entityId.slice(0, 8)}…
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">Not used anywhere yet.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-muted/20 px-2 py-1">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="truncate">{value}</div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
