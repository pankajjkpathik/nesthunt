import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  FileText,
  ShieldCheck,
  FileSearch,
  Info
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelationshipsTab } from "@/components/admin/relationships/RelationshipsTab";
import { RisksTab } from "@/components/admin/intelligence/RisksTab";
import { PromisesTab } from "@/components/admin/intelligence/PromisesTab";
import { DecisionFactorsTab } from "@/components/admin/intelligence/DecisionFactorsTab";
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getPublicUrl } from "@/lib/services/media";
import { ProjectGovernanceTab } from "@/components/admin/ProjectGovernanceTab";
import { useProjectGovernance, useProjectExceptions } from "@/hooks/useProjectGovernance";
import { ProjectGovernanceService } from "@/lib/services/project-governance";
import { ProjectAdminService } from "@/lib/services/projects-cms-integration";

/**
 * PROJECT INTELLIGENCE V1 FROZEN
 * Project Intelligence V1 is feature-complete. Future changes should be limited to bug fixes, 
 * security fixes, data-integrity fixes and explicitly approved V2 work.
 */

import {
  Field,
  NumberField,
  StringListField,
  TextField,
  TextareaField,
} from "@/components/admin/form/Fields";

import {
  useAdminProject,
  useCreateProject,
  useUpdateProject,
} from "@/hooks/useAdminProjects";
import { useAdminPlaces } from "@/hooks/useAdmin";
import { useAdminBuilders } from "@/hooks/useAdminBuilders";
import {
  adminProjectSlugExists,
  AMENITY_CATEGORIES,
  CONSTRUCTION_STATUSES,
  NEARBY_CATEGORIES,
  PROPERTY_TYPES,
  isValidReraNumber,
  slugify,
  type ConstructionStatus,
  type GalleryImage,
  type NearbyEntry,
  type ProjectHero,
  type ProjectInvestment,
  type ProjectPublishStatus,
  type ProjectRera,
  type ProjectRow,
  type ProjectSeo,
  type ProjectStatus,
  type UnitType,
  type ProjectMetrics,
} from "@/lib/services/projects-admin";

interface Props {
  id?: string;
}

interface FormState {
  slug: string;
  name: string;
  status: ProjectStatus;
  publish_status: ProjectPublishStatus;
  verified: boolean;
  featured: boolean;
  tagline: string;
  short_description: string;
  summary: string;
  executive_summary: string;
  property_type: string;
  builder_id: string | null;
  place_id: string | null;
  starting_price: number | null;
  max_price: number | null;
  price_per_sqft: number | null;
  booking_amount: number | null;
  maintenance_charges: string;
  construction_status: ConstructionStatus | null;
  completion_percentage: number | null;
  launch_date: string;
  completion_date: string;
  possession_date: string;
  unit_types: UnitType[];
  amenities: string[];
  nearby: NearbyEntry[];
  rera_number: string;
  rera: ProjectRera;
  investment: ProjectInvestment;
  hero: ProjectHero;
  suitable_for: string[];
  less_suitable_for: string[];
  strengths: string[];
  risks: string[];
  legal: string[];
  progress: string[];
  seo: ProjectSeo;
  gallery: GalleryImage[];
  highlights: string[];
  metrics: ProjectMetrics;
}

const EMPTY: FormState = {
  slug: "",
  name: "",
  status: "planning",
  publish_status: "draft",
  verified: false,
  featured: false,
  tagline: "",
  short_description: "",
  summary: "",
  executive_summary: "",
  property_type: "",
  builder_id: null,
  place_id: null,
  starting_price: null,
  max_price: null,
  price_per_sqft: null,
  booking_amount: null,
  maintenance_charges: "",
  construction_status: null,
  completion_percentage: null,
  launch_date: "",
  completion_date: "",
  possession_date: "",
  unit_types: [],
  amenities: [],
  nearby: [],
  rera_number: "",
  rera: {},
  investment: {},
  hero: {},
  suitable_for: [],
  less_suitable_for: [],
  strengths: [],
  risks: [],
  legal: [],
  progress: [],
  seo: {},
  gallery: [],
  highlights: [],
  metrics: {
    unitTypes: "",
    priceRange: "",
    possessionYear: 0,
    totalUnits: 0,
  },
};

function rowToForm(row: ProjectRow): FormState {
  return {
    slug: row.slug ?? "",
    name: row.name ?? "",
    status: (row.status ?? "planning") as ProjectStatus,
    publish_status: (row.publish_status ?? "draft") as ProjectPublishStatus,
    verified: !!row.verified,
    featured: !!row.featured,
    tagline: row.tagline ?? "",
    short_description: row.short_description ?? "",
    summary: row.summary ?? "",
    executive_summary: row.executive_summary ?? "",
    property_type: row.property_type ?? "",
    builder_id: row.builder_id,
    place_id: row.place_id,
    starting_price: row.starting_price,
    max_price: row.max_price,
    price_per_sqft: row.price_per_sqft,
    booking_amount: row.booking_amount,
    maintenance_charges: row.maintenance_charges ?? "",
    construction_status: row.construction_status,
    completion_percentage: row.completion_percentage,
    launch_date: row.launch_date ?? "",
    completion_date: row.completion_date ?? "",
    possession_date: row.possession_date ?? "",
    unit_types: Array.isArray(row.unit_types) ? row.unit_types : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    nearby: Array.isArray(row.nearby) ? row.nearby : [],
    rera_number: row.rera_number ?? "",
    rera: (row.rera ?? {}) as ProjectRera,
    investment: (row.investment ?? {}) as ProjectInvestment,
    hero: (row.hero ?? {}) as ProjectHero,
    suitable_for: row.suitable_for ?? [],
    less_suitable_for: row.less_suitable_for ?? [],
    strengths: row.strengths ?? [],
    risks: row.risks ?? [],
    legal: row.legal ?? [],
    progress: row.progress ?? [],
    seo: (row.seo ?? {}) as ProjectSeo,
    gallery: Array.isArray(row.hero?.gallery) ? row.hero.gallery : [],
    highlights: (row as any).highlights ?? [],
    metrics: (row.metrics ?? {}) as ProjectMetrics,
  };
}

function formToPayload(f: FormState) {
  return {
    slug: f.slug,
    name: f.name,
    status: f.status,
    publish_status: f.publish_status,
    verified: f.verified,
    featured: f.featured,
    tagline: f.tagline || null,
    short_description: f.short_description || null,
    summary: f.summary,
    executive_summary: f.executive_summary || null,
    property_type: f.property_type || null,
    builder_id: f.builder_id,
    place_id: f.place_id,
    starting_price: f.starting_price,
    max_price: f.max_price,
    price_per_sqft: f.price_per_sqft,
    booking_amount: f.booking_amount,
    maintenance_charges: f.maintenance_charges || null,
    construction_status: f.construction_status,
    completion_percentage: f.completion_percentage,
    launch_date: f.launch_date || null,
    completion_date: f.completion_date || null,
    possession_date: f.possession_date || null,
    unit_types: f.unit_types.map((u, i) => ({ ...u, order: u.order ?? i })),
    amenities: f.amenities,
    nearby: f.nearby.map((n, i) => ({ ...n, order: n.order ?? i })),
    rera_number: f.rera_number || null,
    rera: f.rera,
    investment: f.investment,
    hero: { ...f.hero, gallery: f.gallery },
    suitable_for: f.suitable_for,
    less_suitable_for: f.less_suitable_for,
    strengths: f.strengths,
    risks: f.risks,
    legal: f.legal,
    progress: f.progress,
    seo: f.seo,
    metrics: {
      unitTypes: f.unit_types.map((u) => u.type).filter(Boolean).join(", "),
      priceRange:
        f.starting_price && f.max_price
          ? `₹${f.starting_price} – ₹${f.max_price}`
          : f.starting_price
            ? `from ₹${f.starting_price}`
            : "",
      possessionYear: f.possession_date ? new Date(f.possession_date).getFullYear() : 0,
      reraAuthority: f.metrics.reraAuthority || null,
      reraStatus: f.metrics.reraStatus || null,
      reraUrl: f.metrics.reraUrl || null,
      totalUnits: 0,
    },
  };
}

export function ProjectEditor({ id }: Props) {
  const isNew = !id;
  const navigate = useNavigate();
  const { data: row, isLoading } = useAdminProject(id);
  const { data: builders = [] } = useAdminBuilders();
  const { data: places = [] } = useAdminPlaces();
  const createMut = useCreateProject();
  const updateMut = useUpdateProject();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [tab, setTab] = useState("general");
  const [slugDirty, setSlugDirty] = useState(false);
  const [slugTaken, setSlugTaken] = useState(false);

  useEffect(() => {
    if (row) {
      setForm(rowToForm(row));
      setSlugDirty(true);
    }
  }, [row]);

  const [mediaPicker, setMediaPicker] = useState<{ open: boolean; target: "hero" | "gallery" }>({
    open: false,
    target: "hero",
  });

  useEffect(() => {
    if (isNew && !slugDirty && form.name) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, isNew, slugDirty]);

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!form.slug) { setSlugTaken(false); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const exists = await adminProjectSlugExists(form.slug, id);
        if (!cancelled) setSlugTaken(exists);
      } catch { /* ignore */ }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [form.slug, id]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reraOk = isValidReraNumber(form.rera_number);
  const priceRangeOk =
    !(form.starting_price && form.max_price) ||
    Number(form.starting_price) <= Number(form.max_price);

  const canSave =
    !!form.name.trim() && !!form.slug.trim() && reraOk && priceRangeOk && !slugTaken;

  async function save(nextPublish?: ProjectPublishStatus) {
    if (!canSave) {
      toast.error("Fix validation errors before saving");
      return;
    }
    const payload = formToPayload({
      ...form,
      publish_status: nextPublish ?? form.publish_status,
    });
    try {
      if (isNew) {
        const created = await createMut.mutateAsync(payload as never);
        toast.success("Project created");
        navigate({ to: "/admin/projects/$id", params: { id: created.id } });
      } else {
        await ProjectAdminService.updateProjectIntelligence(id!, payload as any);
        toast.success("Project saved");
        if (nextPublish) set("publish_status", nextPublish);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading project…
      </div>
    );
  }

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Back to Projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isNew ? "New Project" : form.name || "Untitled Project"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>/{form.slug || "…"}</span>
              <Badge variant="outline" className="capitalize">{form.publish_status}</Badge>
              {form.verified ? <Badge className="bg-success/10 text-success">Verified</Badge> : null}
              {form.featured ? <Badge className="bg-accent/10 text-accent">Featured</Badge> : null}
              {slugTaken ? <Badge variant="destructive">Slug taken</Badge> : null}
              {!reraOk ? <Badge variant="destructive">Invalid RERA</Badge> : null}
              {!priceRangeOk ? <Badge variant="destructive">Invalid price range</Badge> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && form.slug ? (
            <Link
              to={`/projects/$slug` as any}
              params={{ slug: form.slug } as any}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </Link>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={saving || !canSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save draft
          </Button>
          <Button variant="outline" size="sm" onClick={() => save("review")} disabled={saving || !canSave}>
            Submit for review
          </Button>
          <Button size="sm" onClick={() => save("published")} disabled={saving || !canSave}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Publish
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="relations">Relationships</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="units">Unit Types</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="rera">RERA</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="governance">Intake & Verification</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField label="Project Name" value={form.name} onChange={(v) => set("name", v)} />
              <Field
                label="Slug"
                hint={slugTaken ? "This slug is already used by another project." : "URL slug, e.g. hero-homes"}
              >
                <Input
                  value={form.slug}
                  onChange={(e) => { setSlugDirty(true); set("slug", slugify(e.target.value)); }}
                  aria-invalid={slugTaken}
                  className={slugTaken ? "border-destructive" : ""}
                />
              </Field>
              <TextField label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
              <Field label="Property Type">
                <Select
                  value={form.property_type || ""}
                  onValueChange={(v) => set("property_type", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <TextareaField
                label="Short Description"
                value={form.short_description}
                onChange={(v) => set("short_description", v)}
                rows={2}
              />
              <TextareaField
                label="Summary"
                value={form.summary}
                onChange={(v) => set("summary", v)}
                rows={3}
              />
              <div className="md:col-span-2">
                <TextareaField
                  label="Executive Summary"
                  value={form.executive_summary}
                  onChange={(v) => set("executive_summary", v)}
                  rows={5}
                />
              </div>
              <Field label="Lifecycle status">
                <Select value={form.status} onValueChange={(v) => set("status", v as ProjectStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="under-construction">Under construction</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.verified} onCheckedChange={(v) => set("verified", v)} />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                  Featured
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations">
          <div className="space-y-4">
            <Card>
              <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                <Field label="Builder" hint="The developer building this project.">
                  <Select
                    value={form.builder_id ?? "__none"}
                    onValueChange={(v) => set("builder_id", v === "__none" ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select builder" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— None —</SelectItem>
                      {builders.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Place" hint="The location this project belongs to.">
                  <Select
                    value={form.place_id ?? "__none"}
                    onValueChange={(v) => set("place_id", v === "__none" ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select place" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— None —</SelectItem>
                      {places.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>
            {id ? (
              <RelationshipsTab entity={{ type: "project", id }} />
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Save this project first to manage extended relationships.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>


        <TabsContent value="pricing">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <NumberField
                label="Minimum price (₹)"
                value={form.starting_price ?? 0}
                onChange={(v) => set("starting_price", v || null)}
              />
              <NumberField
                label="Maximum price (₹)"
                value={form.max_price ?? 0}
                onChange={(v) => set("max_price", v || null)}
              />
              <NumberField
                label="Average price (₹)"
                value={form.investment.averagePrice ?? 0}
                onChange={(v) => set("investment", { ...form.investment, averagePrice: v || undefined })}
              />
              <NumberField
                label="Price per sq. ft. (₹)"
                value={form.price_per_sqft ?? 0}
                onChange={(v) => set("price_per_sqft", v || null)}
              />
              <NumberField
                label="Booking amount (₹)"
                value={form.booking_amount ?? 0}
                onChange={(v) => set("booking_amount", v || null)}
              />
              <TextField
                label="PLC (Preferential Location Charges)"
                value={form.investment.plc ?? ""}
                onChange={(v) => set("investment", { ...form.investment, plc: v })}
                hint="e.g. ₹200 / sq.ft. for park-facing"
              />
              <TextField
                label="Maintenance charges"
                value={form.maintenance_charges}
                onChange={(v) => set("maintenance_charges", v)}
                hint="e.g. ₹3.5 / sq.ft. / month"
              />
              {!priceRangeOk ? (
                <p className="md:col-span-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  Minimum price cannot exceed maximum price.
                </p>
              ) : null}
              <p className="md:col-span-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Price History timeline will appear here in a future build.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card>
            <CardContent className="space-y-4 p-6">
              <UnitTypesEditor items={form.unit_types} onChange={(v) => set("unit_types", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities">
          <Card>
            <CardContent className="space-y-6 p-6">
              <Label className="text-sm font-medium">Amenities</Label>
              {AMENITY_CATEGORIES.map((cat) => (
                <div key={cat.label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {cat.items.map((item) => {
                      const key = `${cat.label}:${item}`;
                      const checked = form.amenities.includes(key);
                      return (
                        <label
                          key={key}
                          className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = new Set(form.amenities);
                              if (v) next.add(key); else next.delete(key);
                              set("amenities", Array.from(next));
                            }}
                          />
                          {item}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <StringListField
                label="Custom amenities"
                items={form.amenities.filter((a) => !a.includes(":"))}
                onChange={(custom) => {
                  const presets = form.amenities.filter((a) => a.includes(":"));
                  set("amenities", [...presets, ...custom]);
                }}
                placeholder="Add a custom amenity"
                hint="Stored without a category."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField
                label="Hero image URL"
                value={form.hero.heroImageUrl ?? ""}
                onChange={(v) => set("hero", { ...form.hero, heroImageUrl: v })}
              />
              <TextField
                label="Cover image URL"
                value={form.hero.coverImageUrl ?? ""}
                onChange={(v) => set("hero", { ...form.hero, coverImageUrl: v })}
              />
              <TextField
                label="Master plan URL"
                value={form.hero.masterPlanUrl ?? ""}
                onChange={(v) => set("hero", { ...form.hero, masterPlanUrl: v })}
              />
              <TextField
                label="Brochure URL"
                value={form.hero.brochureUrl ?? ""}
                onChange={(v) => set("hero", { ...form.hero, brochureUrl: v })}
              />
              <div className="md:col-span-2">
                <GalleryEditor
                  label="Gallery images"
                  items={form.hero.gallery ?? []}
                  onChange={(v) => set("hero", { ...form.hero, gallery: v })}
                />
              </div>
              <div className="md:col-span-2">
                <GalleryEditor
                  label="Floor plans"
                  items={form.hero.floorPlans ?? []}
                  onChange={(v) => set("hero", { ...form.hero, floorPlans: v })}
                />
              </div>
              <p className="md:col-span-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Video tour uploads are on the roadmap.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="construction">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Construction status">
                <Select
                  value={form.construction_status ?? ""}
                  onValueChange={(v) => set("construction_status", v as ConstructionStatus)}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {CONSTRUCTION_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <NumberField
                label="Completion (%)"
                value={form.completion_percentage ?? 0}
                onChange={(v) => set("completion_percentage", Math.max(0, Math.min(100, v)))}
                min={0}
                max={100}
              />
              <div className="md:col-span-2">
                <Field label="Progress">
                  <ProgressBar value={form.completion_percentage ?? 0} />
                </Field>
              </div>
              <TextField
                label="Launch date"
                type="date"
                value={form.launch_date}
                onChange={(v) => set("launch_date", v)}
              />
              <TextField
                label="Expected completion date"
                type="date"
                value={form.completion_date}
                onChange={(v) => set("completion_date", v)}
              />
              <TextField
                label="Possession date"
                type="date"
                value={form.possession_date}
                onChange={(v) => set("possession_date", v)}
              />
              <div className="md:col-span-2">
                <StringListField
                  label="Progress milestones"
                  items={form.progress}
                  onChange={(v) => set("progress", v)}
                  placeholder="e.g. Foundation completed Q2 2025"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rera">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField
                label="RERA Number"
                value={form.rera_number}
                onChange={(v) => set("rera_number", v)}
                hint={!reraOk ? "Enter a valid RERA number (6+ alphanumeric)" : "Primary registration"}
              />
              <TextField
                label="RERA Authority"
                value={form.metrics.reraAuthority ?? ""}
                onChange={(v) => set("metrics", { ...form.metrics, reraAuthority: v })}
                hint="e.g. Haryana Real Estate Regulatory Authority"
              />
              <TextField
                label="RERA Status"
                value={form.metrics.reraStatus ?? ""}
                onChange={(v) => set("metrics", { ...form.metrics, reraStatus: v })}
                hint="e.g. Registered, Applied"
              />
              <TextField
                label="RERA Portal URL"
                value={form.metrics.reraUrl ?? ""}
                onChange={(v) => set("metrics", { ...form.metrics, reraUrl: v })}
                hint="Direct link to project on RERA website"
              />
              <TextField
                label="Registration date"
                type="date"
                value={form.rera.registrationDate ?? ""}
                onChange={(v) => set("rera", { ...form.rera, registrationDate: v })}
              />
              <TextField
                label="Valid until"
                type="date"
                value={form.rera.validUntil ?? ""}
                onChange={(v) => set("rera", { ...form.rera, validUntil: v })}
              />
              <TextField
                label="Certificate URL"
                value={form.rera.certificateUrl ?? ""}
                onChange={(v) => set("rera", { ...form.rera, certificateUrl: v })}
              />
              <div className="md:col-span-2">
                <StringListField
                  label="Legal notes"
                  items={form.legal}
                  onChange={(v) => set("legal", v)}
                  placeholder="e.g. Land title verified by Amicus & Co."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <Card>
            <CardContent className="space-y-4 p-6">
              <NearbyEditor items={form.nearby} onChange={(v) => set("nearby", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investment">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField
                label="Expected rental yield"
                value={form.investment.rentalYield ?? ""}
                onChange={(v) => set("investment", { ...form.investment, rentalYield: v })}
                hint="e.g. 3.5% / annum"
              />
              <TextField
                label="Expected appreciation"
                value={form.investment.appreciation ?? ""}
                onChange={(v) => set("investment", { ...form.investment, appreciation: v })}
                hint="e.g. 12% CAGR"
              />
              <TextField
                label="Capital growth (5Y)"
                value={form.investment.capitalGrowth ?? ""}
                onChange={(v) => set("investment", { ...form.investment, capitalGrowth: v })}
              />
              <TextField
                label="Demand index"
                value={form.investment.demandIndex ?? ""}
                onChange={(v) => set("investment", { ...form.investment, demandIndex: v })}
              />
              <TextField
                label="Liquidity score"
                value={form.investment.liquidityScore ?? ""}
                onChange={(v) => set("investment", { ...form.investment, liquidityScore: v })}
              />
              <Field label="Investment grade" hint="A / B / C or custom label">
                <Select
                  value={form.investment.investmentGrade ?? ""}
                  onValueChange={(v) => set("investment", { ...form.investment, investmentGrade: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextField
                label="Overall rating"
                value={form.investment.rating ?? ""}
                onChange={(v) => set("investment", { ...form.investment, rating: v })}
              />
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <StringListField
                  label="Suitable for"
                  items={form.suitable_for}
                  onChange={(v) => set("suitable_for", v)}
                />
                <StringListField
                  label="Less suitable for"
                  items={form.less_suitable_for}
                  onChange={(v) => set("less_suitable_for", v)}
                />
                <StringListField label="Suitable for" items={form.suitable_for} onChange={(v) => set("suitable_for", v)} />
                <div className="md:col-span-2 rounded-md border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Intelligence Migration Active</p>
                  Strengths, Risks, and Promises are now managed under the <strong>Intelligence</strong> tab using the generic Decision Intelligence architecture.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Project Gallery</h3>
                  <p className="text-xs text-muted-foreground">Manage project photos and captions.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMediaPicker({ open: true, target: "gallery" })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add from DAM
                </Button>
              </div>

              <GalleryManager
                images={form.gallery}
                onChange={(v) => set("gallery", v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="narrative" className="space-y-6 pt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <TextareaField 
                label="Executive Summary" 
                hint="High-level narrative shown at the top of the project report."
                value={form.executive_summary} 
                onChange={(v) => set("executive_summary", v)} 
                rows={8}
              />
              
              <StringListField 
                label="Key Highlights" 
                hint="Bullet points for quick scanning."
                items={form.highlights} 
                onChange={(v) => set("highlights", v)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence">
          <div className="space-y-6">
            {!isNew && (
              <>
                <RisksTab entityType="project" entityId={id} />
                <PromisesTab entityType="project" entityId={id} />
                <DecisionFactorsTab entityType="project" entityId={id} />
              </>
            )}
            {isNew && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Save the project first to manage intelligence records.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <SeoField
                label="Meta title"
                value={form.seo.title ?? ""}
                onChange={(v) => set("seo", { ...form.seo, title: v })}
                max={60}
              />
              <SeoField
                label="Canonical URL"
                value={form.seo.canonicalUrl ?? ""}
                onChange={(v) => set("seo", { ...form.seo, canonicalUrl: v })}
              />
              <div className="md:col-span-2">
                <SeoTextarea
                  label="Meta description"
                  value={form.seo.description ?? ""}
                  onChange={(v) => set("seo", { ...form.seo, description: v })}
                  max={160}
                />
              </div>
              <TextField
                label="Keywords"
                value={form.seo.keywords ?? ""}
                onChange={(v) => set("seo", { ...form.seo, keywords: v })}
                hint="Comma-separated"
              />
              <TextField
                label="OG title"
                value={form.seo.ogTitle ?? ""}
                onChange={(v) => set("seo", { ...form.seo, ogTitle: v })}
              />
              <TextField
                label="OG image URL"
                value={form.seo.ogImage ?? ""}
                onChange={(v) => set("seo", { ...form.seo, ogImage: v })}
              />
              <TextField
                label="Twitter card"
                value={form.seo.twitterCard ?? ""}
                onChange={(v) => set("seo", { ...form.seo, twitterCard: v })}
                hint="e.g. summary_large_image"
              />
              <div className="md:col-span-2">
                <TextareaField
                  label="OG description"
                  value={form.seo.ogDescription ?? ""}
                  onChange={(v) => set("seo", { ...form.seo, ogDescription: v })}
                />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  label="Structured data (JSON-LD)"
                  value={form.seo.structuredData ?? ""}
                  onChange={(v) => set("seo", { ...form.seo, structuredData: v })}
                  rows={5}
                  hint="Placeholder — validated at publish time in a future build."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MediaPicker
        open={mediaPicker.open}
        onClose={() => setMediaPicker({ ...mediaPicker, open: false })}
        folder="projects"
        onSelect={(assets) => {
          if (mediaPicker.target === "hero") {
            const url = getPublicUrl(assets[0].storagePath);
            set("hero", { ...form.hero, heroImageUrl: url, alt: assets[0].alt || assets[0].fileName });
          } else {
            const newImages = assets.map(a => ({ 
              url: getPublicUrl(a.storagePath), 
              caption: a.alt || a.fileName 
            }));
            set("gallery", [...form.gallery, ...newImages]);
          }
        }}
        multiple={mediaPicker.target === "gallery"}
      />
    </div>
  );
}

// -----------------------------
// Sub-editors
// -----------------------------

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{pct}% complete</p>
    </div>
  );
}

function useReorder<T>(items: T[], onChange: (v: T[]) => void) {
  return useMemo(
    () => ({
      moveUp: (i: number) => {
        if (i <= 0) return;
        const next = [...items];
        [next[i - 1], next[i]] = [next[i], next[i - 1]];
        onChange(next);
      },
      moveDown: (i: number) => {
        if (i >= items.length - 1) return;
        const next = [...items];
        [next[i + 1], next[i]] = [next[i], next[i + 1]];
        onChange(next);
      },
    }),
    [items, onChange],
  );
}

function UnitTypesEditor({
  items,
  onChange,
}: {
  items: UnitType[];
  onChange: (v: UnitType[]) => void;
}) {
  const { moveUp, moveDown } = useReorder(items, onChange);
  const update = (i: number, patch: Partial<UnitType>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([
      ...items,
      { type: "", area: "", superArea: "", carpetArea: "", priceRange: "", availability: "" },
    ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Unit configuration</Label>
          <p className="text-xs text-muted-foreground">
            Reorder units with the up / down controls.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 h-4 w-4" /> Add unit
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          No unit types yet — add configurations like 2BHK, 3BHK, etc.
        </p>
      ) : null}
      {items.map((u, i) => (
        <Card key={i}>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                #{i + 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <TextField label="Type" value={u.type} onChange={(v) => update(i, { type: v })} />
            <TextField
              label="Area"
              value={u.area ?? ""}
              onChange={(v) => update(i, { area: v })}
              hint="e.g. 1200 sq.ft."
            />
            <TextField
              label="Super area"
              value={u.superArea ?? ""}
              onChange={(v) => update(i, { superArea: v })}
            />
            <TextField
              label="Carpet area"
              value={u.carpetArea ?? ""}
              onChange={(v) => update(i, { carpetArea: v })}
            />
            <TextField
              label="Price range"
              value={u.priceRange ?? ""}
              onChange={(v) => update(i, { priceRange: v })}
            />
            <TextField
              label="Availability"
              value={u.availability ?? ""}
              onChange={(v) => update(i, { availability: v })}
              hint="e.g. 12 units left"
            />
            <TextField
              label="Facing"
              value={u.facing ?? ""}
              onChange={(v) => update(i, { facing: v })}
            />
            <TextField
              label="Floor plan URL"
              value={u.floorPlanUrl ?? ""}
              onChange={(v) => update(i, { floorPlanUrl: v })}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NearbyEditor({
  items,
  onChange,
}: {
  items: NearbyEntry[];
  onChange: (v: NearbyEntry[]) => void;
}) {
  const { moveUp, moveDown } = useReorder(items, onChange);
  const update = (i: number, patch: Partial<NearbyEntry>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...items, { category: "Education", name: "", distance: "", description: "" }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Nearby infrastructure</Label>
          <p className="text-xs text-muted-foreground">Grouped by category, order preserved.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 h-4 w-4" /> Add entry
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
          Add schools, hospitals, transit, malls, etc.
        </p>
      ) : null}
      {items.map((n, i) => (
        <Card key={i}>
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            <div className="md:col-span-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                #{i + 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <Field label="Category">
              <Select value={n.category} onValueChange={(v) => update(i, { category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NEARBY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <TextField label="Name" value={n.name} onChange={(v) => update(i, { name: v })} />
            <TextField
              label="Distance"
              value={n.distance ?? ""}
              onChange={(v) => update(i, { distance: v })}
              hint="e.g. 2.4 km"
            />
            <div />
            <div className="md:col-span-4">
              <TextareaField
                label="Description"
                value={n.description ?? ""}
                onChange={(v) => update(i, { description: v })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GalleryEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: GalleryImage[];
  onChange: (v: GalleryImage[]) => void;
}) {
  const update = (i: number, patch: Partial<GalleryImage>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { url: "", caption: "" }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 h-4 w-4" /> Add image
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
          No images yet.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((img, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-3">
              {img.url ? (
                <img
                  src={img.url}
                  alt=""
                  className="h-32 w-full rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                  No preview
                </div>
              )}
              <Input
                value={img.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="Image URL"
              />
              <Input
                value={img.caption ?? ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SeoField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  const count = value.length;
  const over = max != null && count > max;
  return (
    <Field
      label={label}
      hint={max != null ? `${count}/${max}${over ? " — too long" : ""}` : undefined}
    >
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function GalleryManager({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (v: GalleryImage[]) => void;
}) {
  const update = (i: number, patch: Partial<GalleryImage>) => {
    const next = [...images];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  const move = (i: number, delta: number) => {
    const next = [...images];
    const target = i + delta;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(i, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Image {i + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={i === images.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {img.url ? (
                <img
                  src={img.url}
                  alt=""
                  className="h-32 w-full rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                  No preview
                </div>
              )}
              <Input
                value={img.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="Image URL"
              />
              <Input
                value={img.caption ?? ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                placeholder="Caption (optional)"
              />
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {images.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No gallery images. Use "Add from DAM" or provide URLs below.
        </div>
      )}
    </div>
  );
}


function SeoTextarea({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  const count = value.length;
  const over = max != null && count > max;
  return (
    <Field
      label={label}
      hint={max != null ? `${count}/${max}${over ? " — too long" : ""}` : undefined}
    >
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
