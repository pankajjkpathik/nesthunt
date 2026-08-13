import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Loader2, Plus, Save, Trash2, Upload, FileText, ShieldAlert, History } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

import {
  Field,
  NumberField,
  StringListField,
  TextField,
  TextareaField,
} from "@/components/admin/form/Fields";
import { MediaField } from "@/components/admin/media/MediaField";

import { EvidenceTab } from "@/components/admin/builders/EvidenceTab";
import { RisksTab } from "@/components/admin/builders/RisksTab";
import { PromiseLedgerTab } from "@/components/admin/builders/PromiseLedgerTab";

import {
  useAdminBuilder,
  useAttachBuilderPlace,
  useBuilderPlaces,
  useBuilderProjects,
  useCreateBuilder,
  useDetachBuilderPlace,
  useUpdateBuilder,
} from "@/hooks/useAdminBuilders";
import { useAdminPlaces } from "@/hooks/useAdmin";
import {
  computeTrustScore,
  DEFAULT_TRUST_BREAKDOWN,
  slugify,
  type AwardEntry,
  type BuilderHero,
  type BuilderRow,
  type BuilderSeo,
  type BuilderStatus,
  type CertificationEntry,
  type LeadershipMember,
  type ReraEntry,
  type TrustBreakdownEntry,
} from "@/lib/services/builders-admin";

interface Props {
  id?: string;
}

interface FormState {
  slug: string;
  name: string;
  status: BuilderStatus;
  verified: boolean;
  featured: boolean;
  builder_type: string;
  tagline: string;
  summary: string;
  description: string;
  headquarters: string;
  country: string;
  state: string;
  city: string;
  year_established: number | null;
  years_active: number;
  head_office: string;
  website: string;
  email: string;
  phone: string;
  pan: string;
  gst: string;
  company_registration: string;
  organization_type: string;
  employee_count: string;
  strengths: string[];
  watch_outs: string[];
  leadership: LeadershipMember[];
  rera: ReraEntry[];
  awards: AwardEntry[];
  certifications: CertificationEntry[];
  trust_breakdown: TrustBreakdownEntry[];
  hero: BuilderHero;
  seo: BuilderSeo;
}

const EMPTY: FormState = {
  slug: "",
  name: "",
  status: "draft",
  verified: false,
  featured: false,
  builder_type: "Developer",
  tagline: "",
  summary: "",
  description: "",
  headquarters: "",
  country: "India",
  state: "",
  city: "",
  year_established: null,
  years_active: 0,
  head_office: "",
  website: "",
  email: "",
  phone: "",
  pan: "",
  gst: "",
  company_registration: "",
  organization_type: "",
  employee_count: "",
  strengths: [],
  watch_outs: [],
  leadership: [],
  rera: [],
  awards: [],
  certifications: [],
  trust_breakdown: DEFAULT_TRUST_BREAKDOWN,
  hero: {},
  seo: {},
};

function fromRow(row: BuilderRow): FormState {
  return {
    slug: row.slug,
    name: row.name,
    status: ((row.status ?? "draft") as BuilderStatus),
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    builder_type: row.builder_type ?? "Developer",
    tagline: row.tagline ?? "",
    summary: row.summary ?? "",
    description: row.description ?? "",
    headquarters: row.headquarters ?? "",
    country: row.country ?? "India",
    state: row.state ?? "",
    city: row.city ?? "",
    year_established: row.year_established ?? null,
    years_active: row.years_active ?? 0,
    head_office: row.head_office ?? "",
    website: row.website ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    pan: row.pan ?? "",
    gst: row.gst ?? "",
    company_registration: row.company_registration ?? "",
    organization_type: row.organization_type ?? "",
    employee_count: row.employee_count ?? "",
    strengths: row.strengths ?? [],
    watch_outs: row.watch_outs ?? [],
    leadership: (row.leadership as LeadershipMember[] | undefined) ?? [],
    rera: (row.rera as ReraEntry[] | undefined) ?? [],
    awards: (row.awards as AwardEntry[] | undefined) ?? [],
    certifications: (row.certifications as CertificationEntry[] | undefined) ?? [],
    trust_breakdown:
      (row.trust_breakdown as unknown as TrustBreakdownEntry[] | undefined) &&
      (row.trust_breakdown as unknown as TrustBreakdownEntry[]).length > 0
        ? (row.trust_breakdown as unknown as TrustBreakdownEntry[])
        : DEFAULT_TRUST_BREAKDOWN,
    hero: (row.hero as BuilderHero) ?? {},
    seo: (row.seo as BuilderSeo) ?? {},
  };
}

export function BuilderEditor({ id }: Props) {
  const isNew = !id;
  const navigate = useNavigate();
  const { data: existing, isLoading } = useAdminBuilder(id);
  const createMut = useCreateBuilder();
  const updateMut = useUpdateBuilder();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [tab, setTab] = useState("general");
  const [dirty, setDirty] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm(fromRow(existing));
      setSlugManuallyEdited(true);
      setDirty(false);
    }
  }, [existing]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function patchHero<K extends keyof BuilderHero>(key: K, value: BuilderHero[K]) {
    setForm((f) => ({ ...f, hero: { ...f.hero, [key]: value } }));
    setDirty(true);
  }

  function patchSeo<K extends keyof BuilderSeo>(key: K, value: BuilderSeo[K]) {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
    setDirty(true);
  }

  const trustScore = useMemo(() => computeTrustScore(form.trust_breakdown), [form.trust_breakdown]);

  async function save(nextStatus?: BuilderStatus) {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.slug.trim()) return toast.error("Slug is required");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      status: nextStatus ?? form.status,
      verified: form.verified,
      featured: form.featured,
      builder_type: form.builder_type,
      tagline: form.tagline,
      summary: form.summary,
      description: form.description,
      headquarters:
        form.headquarters || [form.city, form.state].filter(Boolean).join(", "),
      country: form.country,
      state: form.state,
      city: form.city,
      year_established: form.year_established,
      years_active: form.years_active || 0,
      head_office: form.head_office,
      website: form.website,
      email: form.email,
      phone: form.phone,
      pan: form.pan,
      gst: form.gst,
      company_registration: form.company_registration,
      organization_type: form.organization_type,
      employee_count: form.employee_count,
      strengths: form.strengths.filter(Boolean),
      watch_outs: form.watch_outs.filter(Boolean),
      leadership: form.leadership,
      rera: form.rera,
      awards: form.awards,
      certifications: form.certifications,
      trust_breakdown: form.trust_breakdown,
      trust_score: trustScore,
      hero: form.hero,
      seo: form.seo,
      // preserve legacy JSON columns
      decision: { score: trustScore, confidence: "Medium" as const, verdict: form.tagline || form.summary },
      metrics: existing?.metrics ?? {},
      timeline: existing?.timeline ?? [],
    };

    try {
      if (isNew) {
        const row = await createMut.mutateAsync(payload as never);
        toast.success("Builder created");
        setDirty(false);
        navigate({ to: "/admin/builders/$id", params: { id: row.id } });
      } else {
        await updateMut.mutateAsync({ id: id!, patch: payload as never });
        toast.success("Builder saved");
        setDirty(false);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading builder…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/builders"
            className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> All builders
          </Link>
          <h1 className="truncate text-2xl font-semibold text-foreground">
            {isNew ? "New Builder" : form.name || "Untitled builder"}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge status={form.status} />
            {form.verified ? <Badge variant="secondary" className="text-[10px]">Verified</Badge> : null}
            {form.featured ? <Badge variant="outline" className="text-[10px]">Featured</Badge> : null}
            {dirty ? <span className="text-warning">Unsaved changes</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && form.slug ? (
            <a
              href={`/builder/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
          ) : null}
          <Button variant="outline" onClick={() => save("draft")} disabled={createMut.isPending || updateMut.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save draft
          </Button>
          <Button variant="secondary" onClick={() => save("review")} disabled={createMut.isPending || updateMut.isPending}>
            Submit for review
          </Button>
          <Button onClick={() => save("published")} disabled={createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Publish
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="rera">RERA & Compliance</TabsTrigger>
          <TabsTrigger value="projects">Portfolio</TabsTrigger>
          <TabsTrigger value="places">Operating Areas</TabsTrigger>
          <TabsTrigger value="media">Branding</TabsTrigger>
          <TabsTrigger value="awards">Awards & Certs</TabsTrigger>
          <TabsTrigger value="trust">Trust Score</TabsTrigger>
          <TabsTrigger value="evidence" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Evidence</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Risks</TabsTrigger>
          <TabsTrigger value="promises" className="gap-1.5"><History className="h-3.5 w-3.5" /> Promises</TabsTrigger>
          <TabsTrigger value="relationships">Network</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField
                label="Builder name"
                value={form.name}
                onChange={(v) => {
                  patch("name", v);
                  if (!slugManuallyEdited && isNew) {
                    setForm((f) => ({ ...f, name: v, slug: slugify(v) }));
                  }
                }}
                placeholder="e.g. Omaxe"
              />
              <TextField
                label="Slug"
                value={form.slug}
                onChange={(v) => {
                  setSlugManuallyEdited(true);
                  patch("slug", slugify(v));
                }}
                hint="URL-safe identifier. Used in /builder/{slug}."
              />
              <TextField
                label="Tagline"
                value={form.tagline}
                onChange={(v) => patch("tagline", v)}
                placeholder="One-line positioning"
              />
              <Field label="Builder type">
                <Select value={form.builder_type} onValueChange={(v) => patch("builder_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Developer", "Contractor", "Consultant", "Investor", "Landowner"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <TextareaField
                  label="Short summary"
                  value={form.summary}
                  onChange={(v) => patch("summary", v)}
                  rows={3}
                  placeholder="1–2 sentence positioning shown on cards and previews."
                />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  label="Full description"
                  value={form.description}
                  onChange={(v) => patch("description", v)}
                  rows={6}
                />
              </div>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => patch("status", v as BuilderStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">In review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">Surface on the homepage.</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={(v) => patch("featured", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label>Verified</Label>
                  <p className="text-xs text-muted-foreground">Passes NestHunt due diligence.</p>
                </div>
                <Switch checked={form.verified} onCheckedChange={(v) => patch("verified", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY */}
        <TabsContent value="company" className="mt-4">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <TextField label="Head office address" value={form.head_office} onChange={(v) => patch("head_office", v)} />
              <TextField label="Headquarters (short)" value={form.headquarters} onChange={(v) => patch("headquarters", v)} placeholder="e.g. Gurugram, Haryana" />
              <TextField label="Country" value={form.country} onChange={(v) => patch("country", v)} />
              <TextField label="State" value={form.state} onChange={(v) => patch("state", v)} />
              <TextField label="City" value={form.city} onChange={(v) => patch("city", v)} />
              <NumberField label="Year established" value={form.year_established ?? 0} onChange={(v) => patch("year_established", v || null)} />
              <NumberField label="Years active" value={form.years_active} onChange={(v) => patch("years_active", v)} />
              <TextField label="Employee count" value={form.employee_count} onChange={(v) => patch("employee_count", v)} placeholder="e.g. 500–1000" />
              <TextField label="Organization type" value={form.organization_type} onChange={(v) => patch("organization_type", v)} placeholder="Private Limited, LLP…" />
              <TextField label="Website" value={form.website} onChange={(v) => patch("website", v)} placeholder="https://" />
              <TextField label="Email" value={form.email} onChange={(v) => patch("email", v)} type="email" />
              <TextField label="Phone" value={form.phone} onChange={(v) => patch("phone", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEADERSHIP */}
        <TabsContent value="leadership" className="mt-4">
          <LeadershipEditor
            items={form.leadership}
            onChange={(next) => patch("leadership", next)}
          />
        </TabsContent>

        {/* RERA */}
        <TabsContent value="rera" className="mt-4">
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="PAN" value={form.pan} onChange={(v) => patch("pan", v.toUpperCase())} />
                <TextField label="GSTIN" value={form.gst} onChange={(v) => patch("gst", v.toUpperCase())} />
                <TextField label="Company registration no." value={form.company_registration} onChange={(v) => patch("company_registration", v)} />
              </div>
              <ReraEditor items={form.rera} onChange={(next) => patch("rera", next)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECTS (readonly) */}
        <TabsContent value="projects" className="mt-4">
          <ProjectsPanel builderId={id} />
        </TabsContent>

        {/* PLACES */}
        <TabsContent value="places" className="mt-4">
          <PlacesPanel builderId={id} />
        </TabsContent>

        {/* MEDIA (hero) */}
        <TabsContent value="media" className="mt-4">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <MediaField label="Logo" value={form.hero.logoUrl ?? ""} onChange={(v) => patchHero("logoUrl", v)} folder="builders" />
              <MediaField label="Hero image" value={form.hero.heroImageUrl ?? ""} onChange={(v) => patchHero("heroImageUrl", v)} folder="builders" />
              <MediaField label="Cover image" value={form.hero.coverImageUrl ?? ""} onChange={(v) => patchHero("coverImageUrl", v)} folder="builders" />
              <TextField label="Hero tagline" value={form.hero.tagline ?? ""} onChange={(v) => patchHero("tagline", v)} />
              <div className="md:col-span-2">
                <TextField label="Headline" value={form.hero.headline ?? ""} onChange={(v) => patchHero("headline", v)} />
              </div>
              <div className="md:col-span-2">
                <TextareaField label="Sub-headline" value={form.hero.subheadline ?? ""} onChange={(v) => patchHero("subheadline", v)} rows={3} />
              </div>
              {form.hero.heroImageUrl ? (
                <div className="md:col-span-2">
                  <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">Preview</Label>
                  <img src={form.hero.heroImageUrl} alt="" className="max-h-64 w-full rounded-lg border border-border object-cover" />
                </div>
              ) : null}
              <div className="md:col-span-2 text-center text-xs text-muted-foreground">
                All images come from the <a href="/admin/media" className="text-accent underline">Media Library</a>.
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* AWARDS */}
        <TabsContent value="awards" className="mt-4 space-y-4">
          <AwardsEditor items={form.awards} onChange={(next) => patch("awards", next)} kind="award" />
          <AwardsEditor items={form.certifications} onChange={(next) => patch("certifications", next)} kind="certification" />
        </TabsContent>

        {/* TRUST */}
        <TabsContent value="trust" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Trust Score breakdown</h3>
                  <p className="text-xs text-muted-foreground">Scored 0–10 per category. The overall Trust Score is the average.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-foreground">{trustScore.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">/ 10</div>
                </div>
              </div>
              <div className="space-y-5">
                {form.trust_breakdown.map((cat, i) => (
                  <div key={i} className="grid grid-cols-1 items-center gap-3 md:grid-cols-[240px_1fr_60px_40px]">
                    <Input
                      value={cat.label}
                      onChange={(e) => {
                        const next = [...form.trust_breakdown];
                        next[i] = { ...next[i], label: e.target.value };
                        patch("trust_breakdown", next);
                      }}
                    />
                    <Slider
                      value={[cat.score]}
                      min={0}
                      max={10}
                      step={0.1}
                      onValueChange={([v]) => {
                        const next = [...form.trust_breakdown];
                        next[i] = { ...next[i], score: v };
                        patch("trust_breakdown", next);
                      }}
                    />
                    <span className="text-right font-medium">{cat.score.toFixed(1)}</span>
                    <Button variant="ghost" size="icon" onClick={() => patch("trust_breakdown", form.trust_breakdown.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => patch("trust_breakdown", [...form.trust_breakdown, { label: "New category", score: 7 }])}
              >
                <Plus className="mr-2 h-4 w-4" /> Add category
              </Button>
            </CardContent>
          </Card>
          <StringListField
            label="Strengths"
            items={form.strengths}
            onChange={(v) => patch("strengths", v)}
            placeholder="What this builder does well"
          />
          <StringListField
            label="Watch-outs"
            items={form.watch_outs}
            onChange={(v) => patch("watch_outs", v)}
            placeholder="Risks or concerns"
          />
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="mt-4">
          <Card>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              <SeoTextField label="Meta title" value={form.seo.title ?? ""} onChange={(v) => patchSeo("title", v)} max={60} />
              <SeoTextField label="Canonical URL" value={form.seo.canonicalUrl ?? ""} onChange={(v) => patchSeo("canonicalUrl", v)} placeholder="https://" />
              <div className="md:col-span-2">
                <SeoTextareaField label="Meta description" value={form.seo.description ?? ""} onChange={(v) => patchSeo("description", v)} max={160} />
              </div>
              <SeoTextField label="Keywords" value={form.seo.keywords ?? ""} onChange={(v) => patchSeo("keywords", v)} placeholder="comma, separated" max={255} />
              <SeoTextField label="Twitter card" value={form.seo.twitterCard ?? "summary_large_image"} onChange={(v) => patchSeo("twitterCard", v)} />
              <SeoTextField label="OG title" value={form.seo.ogTitle ?? ""} onChange={(v) => patchSeo("ogTitle", v)} max={70} />
              <SeoTextField label="OG image URL" value={form.seo.ogImage ?? ""} onChange={(v) => patchSeo("ogImage", v)} placeholder="https://" />
              <div className="md:col-span-2">
                <SeoTextareaField label="OG description" value={form.seo.ogDescription ?? ""} onChange={(v) => patchSeo("ogDescription", v)} max={200} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <EvidenceTab builderId={id} />
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <RisksTab builderId={id} />
        </TabsContent>

        <TabsContent value="promises" className="mt-4">
          <PromiseLedgerTab builderId={id} />
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          {id ? (
            <RelationshipsTab entity={{ type: "builder", id }} />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Save this builder first to manage relationships.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Leadership ----------

function LeadershipEditor({
  items, onChange,
}: {
  items: LeadershipMember[];
  onChange: (next: LeadershipMember[]) => void;
}) {
  function update(i: number, patch: Partial<LeadershipMember>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No leadership entries yet.
          </p>
        ) : (
          items.map((m, i) => (
            <div key={i} className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
              <TextField label="Name" value={m.name ?? ""} onChange={(v) => update(i, { name: v })} />
              <TextField label="Designation" value={m.designation ?? ""} onChange={(v) => update(i, { designation: v })} />
              <TextField label="Photo URL" value={m.photoUrl ?? ""} onChange={(v) => update(i, { photoUrl: v })} />
              <TextField label="LinkedIn" value={m.linkedIn ?? ""} onChange={(v) => update(i, { linkedIn: v })} placeholder="https://linkedin.com/in/…" />
              <div className="md:col-span-2">
                <TextareaField label="Bio" value={m.bio ?? ""} onChange={(v) => update(i, { bio: v })} rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" onClick={() => onChange([...items, { name: "", designation: "" }])}>
          <Plus className="mr-2 h-4 w-4" /> Add leader
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- RERA ----------

function ReraEditor({
  items, onChange,
}: {
  items: ReraEntry[];
  onChange: (next: ReraEntry[]) => void;
}) {
  function update(i: number, patch: Partial<ReraEntry>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">RERA registrations</h4>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No registrations added yet.
          </p>
        ) : (
          items.map((r, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-3">
              <TextField label="Registration no." value={r.registration_number ?? ""} onChange={(v) => update(i, { registration_number: v })} />
              <TextField label="Authority" value={r.authority ?? ""} onChange={(v) => update(i, { authority: v })} placeholder="e.g. HARERA" />
              <Field label="Status">
                <Select value={r.status ?? "active"} onValueChange={(v) => update(i, { status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <TextField label="Registered on" value={r.registration_date ?? ""} onChange={(v) => update(i, { registration_date: v })} placeholder="YYYY-MM-DD" />
              <TextField label="Valid until" value={(r as any).validity_date ?? ""} onChange={(v) => update(i, { validity_date: v } as any)} placeholder="YYYY-MM-DD" />
              <TextField label="Document URL" value={r.registration_url ?? ""} onChange={(v) => update(i, { registration_url: v })} />
              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" onClick={() => onChange([...items, { registration_number: "", authority: "", status: "active" } as any])}>
          <Plus className="mr-2 h-4 w-4" /> Add RERA registration
        </Button>
      </div>
    </div>
  );
}

// ---------- Awards / Certifications ----------

function AwardsEditor({
  items, onChange, kind,
}: {
  items: AwardEntry[] | CertificationEntry[];
  onChange: (next: AwardEntry[]) => void;
  kind: "award" | "certification";
}) {
  const label = kind === "award" ? "Award" : "Certification";
  function update(i: number, patch: Partial<AwardEntry>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch } as AwardEntry;
    onChange(next as AwardEntry[]);
  }
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{label}s</h3>
        </div>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No {label.toLowerCase()}s added yet.
          </p>
        ) : (
          items.map((a, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
              <TextField label="Title" value={a.name ?? ""} onChange={(v) => update(i, { name: v })} />
              <TextField label="Issuer" value={(a as any).organization ?? ""} onChange={(v) => update(i, { organization: v } as any)} />
              <NumberField label="Year" value={(a as any).year_awarded ?? (a as any).year_certified ?? 0} onChange={(v) => update(i, { [kind === "award" ? "year_awarded" : "year_certified"]: v || undefined } as any)} />
              <TextField label="Image URL" value={(a as any).media_url ?? ""} onChange={(v) => update(i, { media_url: v } as any)} />
              <div className="md:col-span-2">
                <TextareaField label="Description" value={a.description ?? ""} onChange={(v) => update(i, { description: v })} rows={2} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => onChange(items.filter((_, idx) => idx !== i) as AwardEntry[])}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" onClick={() => onChange([...(items as AwardEntry[]), { name: "" } as any])}>
          <Plus className="mr-2 h-4 w-4" /> Add {label.toLowerCase()}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Projects (read-only) ----------

function ProjectsPanel({ builderId }: { builderId?: string }) {
  const { data: projects = [], isLoading } = useBuilderProjects(builderId);
  if (!builderId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the builder first to link projects.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Linked projects</h3>
            <p className="text-xs text-muted-foreground">Projects with this builder set as their developer.</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </span>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No projects linked yet. Create projects and set this builder as their developer.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug} · {p.status}</p>
                </div>
                <a
                  href={`/project/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Places ----------

function PlacesPanel({ builderId }: { builderId?: string }) {
  const { data: places = [] } = useAdminPlaces();
  const { data: linkedIds = [], isLoading } = useBuilderPlaces(builderId);
  const attach = useAttachBuilderPlace();
  const detach = useDetachBuilderPlace();
  const [selectValue, setSelectValue] = useState("");

  if (!builderId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the builder first to link places.
        </CardContent>
      </Card>
    );
  }

  const linkedPlaces = places.filter((p) => linkedIds.includes(p.id));
  const availablePlaces = places.filter((p) => !linkedIds.includes(p.id));

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-base font-semibold">Places this builder operates in</h3>
          <p className="text-xs text-muted-foreground">Used to surface this builder inside Place intelligence reports.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select a place to link…" /></SelectTrigger>
            <SelectContent>
              {availablePlaces.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">All places linked.</div>
              ) : (
                availablePlaces.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}{p.city ? ` — ${p.city}` : ""}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={async () => {
              if (!selectValue) return;
              try {
                await attach.mutateAsync({ builderId, placeId: selectValue });
                setSelectValue("");
                toast.success("Place linked");
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            disabled={!selectValue || attach.isPending}
          >
            <Plus className="mr-2 h-4 w-4" /> Link
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : linkedPlaces.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
            No places linked yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {linkedPlaces.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await detach.mutateAsync({ builderId, placeId: p.id });
                      toast.success("Place unlinked");
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Unlink
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- SEO helpers ----------

function SeoTextField({
  label, value, onChange, max, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  placeholder?: string;
}) {
  const over = max != null && value.length > max;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {max ? (
          <span className={`text-[11px] ${over ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length}/{max}
          </span>
        ) : null}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SeoTextareaField({
  label, value, onChange, max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
}) {
  const over = max != null && value.length > max;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {max ? (
          <span className={`text-[11px] ${over ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length}/{max}
          </span>
        ) : null}
      </div>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-success/10 text-success",
    review: "bg-warning/10 text-warning",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-muted text-muted-foreground line-through",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}
