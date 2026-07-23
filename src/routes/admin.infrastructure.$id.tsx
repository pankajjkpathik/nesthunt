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
  useCreateInfrastructure,
  useInfrastructureItem,
  useUpdateInfrastructure,
} from "@/hooks/useInfrastructure";
import {
  INFRASTRUCTURE_CATEGORIES,
  type ContentStatus,
  type InfrastructureCategory,
} from "@/types/content";
import { slugify } from "@/lib/utils/slug";

export const Route = createFileRoute("/admin/infrastructure/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <InfrastructureEditor id={id === "new" ? undefined : id} />;
  },
});

interface Form {
  name: string;
  slug: string;
  category: InfrastructureCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  website: string;
  hours: string;
  status: ContentStatus;
}

const EMPTY: Form = {
  name: "",
  slug: "",
  category: "hospital",
  description: "",
  address: "",
  city: "",
  state: "",
  latitude: null,
  longitude: null,
  phone: "",
  website: "",
  hours: "",
  status: "draft",
};

export function InfrastructureEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const { data: existing } = useInfrastructureItem(id);
  const create = useCreateInfrastructure();
  const update = useUpdateInfrastructure();
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      slug: existing.slug,
      category: (existing.category as InfrastructureCategory) ?? "hospital",
      description: existing.description ?? "",
      address: existing.address ?? "",
      city: existing.city ?? "",
      state: existing.state ?? "",
      latitude: existing.latitude,
      longitude: existing.longitude,
      phone: existing.phone ?? "",
      website: existing.website ?? "",
      hours: existing.hours ?? "",
      status: existing.status as ContentStatus,
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
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      latitude: form.latitude,
      longitude: form.longitude,
      phone: form.phone || null,
      website: form.website || null,
      hours: form.hours || null,
      status: form.status,
    };
    try {
      if (id) {
        await update.mutateAsync({ id, patch: payload });
        toast.success("Saved");
      } else {
        const row = await create.mutateAsync(payload);
        toast.success("Created");
        navigate({ to: "/admin/infrastructure/$id", params: { id: row.id } });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <ContentEditorShell
      title={id ? form.name || "Infrastructure" : "New infrastructure"}
      backHref="/admin/infrastructure"
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
            onValueChange={(v) => set("category", v as InfrastructureCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INFRASTRUCTURE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c.replace(/_/g, " ")}
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
        <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
        <TextField label="State" value={form.state} onChange={(v) => set("state", v)} />
        <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
        <NumberField
          label="Latitude"
          value={form.latitude ?? 0}
          onChange={(v) => set("latitude", Number.isFinite(v) ? v : null)}
          step={0.0001}
        />
        <NumberField
          label="Longitude"
          value={form.longitude ?? 0}
          onChange={(v) => set("longitude", Number.isFinite(v) ? v : null)}
          step={0.0001}
        />
        <TextField label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
        <TextField label="Website" value={form.website} onChange={(v) => set("website", v)} />
        <TextField
          label="Operating hours"
          value={form.hours}
          onChange={(v) => set("hours", v)}
        />
      </div>
    </ContentEditorShell>
  );
}
