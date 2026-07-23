import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Field, TextField, TextareaField, NumberField } from "@/components/admin/form/Fields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MediaField } from "@/components/admin/media/MediaField";
import { ContentEditorShell } from "@/components/admin/content/ContentEditorShell";
import {
  useAmenity,
  useCreateAmenity,
  useUpdateAmenity,
} from "@/hooks/useAmenities";
import {
  AMENITY_CATEGORIES,
  type AmenityCategory,
  type ContentStatus,
} from "@/types/content";
import { slugify } from "@/lib/utils/slug";

export const Route = createFileRoute("/admin/amenities/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <AmenityEditor id={id === "new" ? undefined : id} />;
  },
});

interface Form {
  name: string;
  slug: string;
  category: AmenityCategory;
  description: string;
  icon: string;
  illustration_id: string;
  featured: boolean;
  status: ContentStatus;
  sort_order: number;
  seo_title: string;
  seo_description: string;
}

const EMPTY: Form = {
  name: "",
  slug: "",
  category: "lifestyle",
  description: "",
  icon: "",
  illustration_id: "",
  featured: false,
  status: "draft",
  sort_order: 0,
  seo_title: "",
  seo_description: "",
};

export function AmenityEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { data: existing } = useAmenity(id);
  const create = useCreateAmenity();
  const update = useUpdateAmenity();
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!existing) return;
    const seo = (existing.seo ?? {}) as Record<string, string>;
    setForm({
      name: existing.name,
      slug: existing.slug,
      category: (existing.category as AmenityCategory) ?? "lifestyle",
      description: existing.description ?? "",
      icon: existing.icon ?? "",
      illustration_id: existing.illustration_id ?? "",
      featured: !!existing.featured,
      status: existing.status as ContentStatus,
      sort_order: existing.sort_order,
      seo_title: seo.title ?? "",
      seo_description: seo.description ?? "",
    });
  }, [existing]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      category: form.category,
      description: form.description || null,
      icon: form.icon || null,
      illustration_id: form.illustration_id || null,
      featured: form.featured,
      status: form.status,
      sort_order: form.sort_order,
      seo: { title: form.seo_title, description: form.seo_description },
    };
    try {
      if (id) {
        await update.mutateAsync({ id, patch: payload });
        toast.success("Saved");
      } else {
        const row = await create.mutateAsync(payload);
        toast.success("Created");
        navigate({ to: "/admin/amenities/$id", params: { id: row.id } });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <ContentEditorShell
      title={id ? form.name || "Amenity" : "New amenity"}
      backHref="/admin/amenities"
      status={form.status}
      saving={create.isPending || update.isPending}
      onSave={save}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          placeholder="auto from name"
        />
        <Field label="Category">
          <Select
            value={form.category}
            onValueChange={(v) => set("category", v as AmenityCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AMENITY_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => set("status", v as ContentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Icon (Lucide name)">
          <Input value={form.icon} onChange={(e) => set("icon", e.target.value)} />
        </Field>
        <NumberField
          label="Display order"
          value={form.sort_order}
          onChange={(v) => set("sort_order", v)}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <Label className="text-sm font-medium">Featured</Label>
          <p className="text-xs text-muted-foreground">Highlight in amenity carousels.</p>
        </div>
        <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
      </div>

      <TextareaField
        label="Description"
        value={form.description}
        onChange={(v) => set("description", v)}
      />


      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="SEO title"
          value={form.seo_title}
          onChange={(v) => set("seo_title", v)}
        />
        <TextField
          label="SEO description"
          value={form.seo_description}
          onChange={(v) => set("seo_description", v)}
        />
      </div>
    </ContentEditorShell>
  );
}
