import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Field, TextField, TextareaField } from "@/components/admin/form/Fields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MediaField } from "@/components/admin/media/MediaField";
import { ContentEditorShell } from "@/components/admin/content/ContentEditorShell";
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import type { ContentStatus } from "@/types/content";
import { slugify } from "@/lib/utils/slug";

export const Route = createFileRoute("/admin/categories/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <CategoryEditor id={id === "new" ? undefined : id} />;
  },
});

interface Form {
  name: string;
  slug: string;
  parent_id: string | null;
  description: string;
  icon: string;
  featured_image_url: string;
  status: ContentStatus;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const EMPTY: Form = {
  name: "",
  slug: "",
  parent_id: null,
  description: "",
  icon: "",
  featured_image_url: "",
  status: "draft",
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

export function CategoryEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { data: existing } = useCategory(id);
  const { data: all = [] } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!existing) return;
    const seo = (existing.seo ?? {}) as Record<string, string>;
    setForm({
      name: existing.name,
      slug: existing.slug,
      parent_id: existing.parent_id,
      description: existing.description ?? "",
      icon: existing.icon ?? "",
      featured_image_url: "",
      status: existing.status as ContentStatus,
      sort_order: existing.sort_order,
      seo_title: seo.title ?? "",
      seo_description: seo.description ?? "",
      seo_keywords: seo.keywords ?? "",
    });
  }, [existing]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      parent_id: form.parent_id,
      description: form.description || null,
      icon: form.icon || null,
      status: form.status,
      sort_order: form.sort_order,
      seo: {
        title: form.seo_title,
        description: form.seo_description,
        keywords: form.seo_keywords,
      },
    };
    try {
      if (id) {
        await update.mutateAsync({ id, patch: payload });
        toast.success("Saved");
      } else {
        const row = await create.mutateAsync(payload);
        toast.success("Created");
        navigate({ to: "/admin/categories/$id", params: { id: row.id } });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const parentOptions = all.filter((c) => c.id !== id);

  return (
    <ContentEditorShell
      title={id ? form.name || "Category" : "New category"}
      backHref="/admin/categories"
      status={form.status}
      saving={create.isPending || update.isPending}
      onSave={save}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Name"
          value={form.name}
          onChange={(v) => set("name", v)}
        />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          placeholder="auto from name"
        />
        <Field label="Parent category">
          <Select
            value={form.parent_id ?? "none"}
            onValueChange={(v) => set("parent_id", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None (top level)</SelectItem>
              {parentOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
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
        <Field label="Icon (Lucide name)" hint="e.g. building, home, map-pin">
          <Input value={form.icon} onChange={(e) => set("icon", e.target.value)} />
        </Field>
        <Field label="Sort order">
          <Input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <TextareaField
        label="Short description"
        value={form.description}
        onChange={(v) => set("description", v)}
      />

      <MediaField
        label="Featured image"
        value={form.featured_image_url}
        onChange={(v) => set("featured_image_url", v)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="SEO title"
          value={form.seo_title}
          onChange={(v) => set("seo_title", v)}
        />
        <TextField
          label="SEO keywords"
          value={form.seo_keywords}
          onChange={(v) => set("seo_keywords", v)}
        />
      </div>
      <TextareaField
        label="SEO description"
        value={form.seo_description}
        onChange={(v) => set("seo_description", v)}
      />
    </ContentEditorShell>
  );
}
