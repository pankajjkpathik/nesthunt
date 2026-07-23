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
import { ContentEditorShell } from "@/components/admin/content/ContentEditorShell";
import {
  useCreateUnitType,
  useUnitType,
  useUpdateUnitType,
} from "@/hooks/useUnitTypes";
import {
  UNIT_TYPE_CATEGORIES,
  type ContentStatus,
  type UnitTypeCategory,
} from "@/types/content";
import { slugify } from "@/lib/utils/slug";

export const Route = createFileRoute("/admin/unit-types/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <UnitTypeEditor id={id === "new" ? undefined : id} />;
  },
});

interface Form {
  name: string;
  slug: string;
  category: UnitTypeCategory;
  description: string;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  super_area_min: number | null;
  super_area_max: number | null;
  carpet_area_min: number | null;
  carpet_area_max: number | null;
  facing: string;
  status: ContentStatus;
  sort_order: number;
}

const EMPTY: Form = {
  name: "",
  slug: "",
  category: "residential",
  description: "",
  bedrooms: null,
  bathrooms: null,
  balconies: null,
  super_area_min: null,
  super_area_max: null,
  carpet_area_min: null,
  carpet_area_max: null,
  facing: "",
  status: "draft",
  sort_order: 0,
};

export function UnitTypeEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { data: existing } = useUnitType(id);
  const create = useCreateUnitType();
  const update = useUpdateUnitType();
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      slug: existing.slug,
      category: (existing.category as UnitTypeCategory) ?? "residential",
      description: existing.description ?? "",
      bedrooms: existing.bedrooms,
      bathrooms: existing.bathrooms,
      balconies: existing.balconies,
      super_area_min: existing.super_area_min,
      super_area_max: existing.super_area_max,
      carpet_area_min: existing.carpet_area_min,
      carpet_area_max: existing.carpet_area_max,
      facing: existing.facing ?? "",
      status: existing.status as ContentStatus,
      sort_order: existing.sort_order,
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
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      balconies: form.balconies,
      super_area_min: form.super_area_min,
      super_area_max: form.super_area_max,
      carpet_area_min: form.carpet_area_min,
      carpet_area_max: form.carpet_area_max,
      facing: form.facing || null,
      status: form.status,
      sort_order: form.sort_order,
    };
    try {
      if (id) {
        await update.mutateAsync({ id, patch: payload });
        toast.success("Saved");
      } else {
        const row = await create.mutateAsync(payload);
        toast.success("Created");
        navigate({ to: "/admin/unit-types/$id", params: { id: row.id } });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const num = (v: number) => (Number.isFinite(v) && v !== 0 ? v : null);

  return (
    <ContentEditorShell
      title={id ? form.name || "Unit type" : "New unit type"}
      backHref="/admin/unit-types"
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
            onValueChange={(v) => set("category", v as UnitTypeCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_TYPE_CATEGORIES.map((c) => (
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
      </div>

      <TextareaField
        label="Description"
        value={form.description}
        onChange={(v) => set("description", v)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <NumberField
          label="Bedrooms"
          value={form.bedrooms ?? 0}
          onChange={(v) => set("bedrooms", num(v))}
        />
        <NumberField
          label="Bathrooms"
          value={form.bathrooms ?? 0}
          onChange={(v) => set("bathrooms", num(v))}
        />
        <NumberField
          label="Balconies"
          value={form.balconies ?? 0}
          onChange={(v) => set("balconies", num(v))}
        />
        <NumberField
          label="Super area min (sqft)"
          value={form.super_area_min ?? 0}
          onChange={(v) => set("super_area_min", num(v))}
        />
        <NumberField
          label="Super area max (sqft)"
          value={form.super_area_max ?? 0}
          onChange={(v) => set("super_area_max", num(v))}
        />
        <NumberField
          label="Carpet area min (sqft)"
          value={form.carpet_area_min ?? 0}
          onChange={(v) => set("carpet_area_min", num(v))}
        />
        <NumberField
          label="Carpet area max (sqft)"
          value={form.carpet_area_max ?? 0}
          onChange={(v) => set("carpet_area_max", num(v))}
        />
        <TextField label="Facing" value={form.facing} onChange={(v) => set("facing", v)} />
        <NumberField
          label="Sort order"
          value={form.sort_order}
          onChange={(v) => set("sort_order", v)}
        />
      </div>
    </ContentEditorShell>
  );
}
