import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Save, Send, Globe, Loader2, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RelationshipsTab } from "@/components/admin/relationships/RelationshipsTab";
import { EvidenceTab } from "@/components/admin/places/EvidenceTab";
import { RisksTab as StructuredRisksTab } from "@/components/admin/places/RisksTab";
import { PromiseLedgerTab } from "@/components/admin/places/PromiseLedgerTab";
import {
  MarketIntelligenceTab,
  type MarketIntelligenceValues,
} from "@/components/admin/places/MarketIntelligenceTab";
import { NarrativeTab, type NarrativeValues } from "@/components/admin/places/NarrativeTab";
import { checkPublishReadiness } from "@/lib/services/place-validation";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  TextField,
  TextareaField,
  StringListField,
  NumberField,
  Field,
} from "@/components/admin/form/Fields";
import {
  useAdminPlace,
  useCreatePlace,
  useUpdatePlace,
} from "@/hooks/useAdmin";
import {
  computeDecisionScore,
  DEFAULT_CATEGORIES,
  slugify,
  type CategoryScore,
  type PlaceDecision,
  type PlaceHero,
  type PlaceMetrics,
  type PlaceRow,
  type PlaceSeo,
  type PlaceStatus,

} from "@/lib/services/places-admin";
import { useEntityImages } from "@/hooks/useNestHunt";
import {
  addEntityImage,
  getPublicUrl,
  removeEntityImage,
  uploadMedia,
} from "@/lib/services/media-admin";
import { useQueryClient } from "@tanstack/react-query";


interface FormState {
  slug: string;
  name: string;
  official_name: string;
  region: string;
  country: string;
  state: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  summary: string;
  status: PlaceStatus;
  featured: boolean;
  risks: string[];
  lifestyle: string[];
  education: string[];
  healthcare: string[];
  growth_drivers: string[];
  hero: PlaceHero;
  seo: PlaceSeo;
  metrics: PlaceMetrics;
  decision: PlaceDecision;
  market: MarketIntelligenceValues;
  narrative: NarrativeValues;
}

const EMPTY_MARKET: MarketIntelligenceValues = {
  market_segment: null,
  investment_category: null,
  development_stage: null,
  average_price: null,
  price_min: null,
  price_max: null,
  rental_yield: null,
  absorption_rate: null,
  vacancy_rate: null,
  connectivity_summary: null,
  employment_summary: null,
  investment_outlook: null,
  growth_outlook: null,
  livability_outlook: null,
};

const EMPTY_NARRATIVE: NarrativeValues = {
  executive_summary: "",
  highlights: [],
  weaknesses: [],
  opportunities: [],
  recommendation: null,
};

const EMPTY: FormState = {
  slug: "",
  name: "",
  official_name: "",
  region: "",
  country: "India",
  state: "",
  city: "",
  latitude: null,
  longitude: null,
  summary: "",
  status: "draft",
  featured: false,
  risks: [],
  lifestyle: [],
  education: [],
  healthcare: [],
  growth_drivers: [],
  hero: {},
  seo: {},
  metrics: {},
  decision: {
    score: 0,
    confidence: "Medium",
    verdict: "",
    categoryRatings: DEFAULT_CATEGORIES,
  },
  market: EMPTY_MARKET,
  narrative: EMPTY_NARRATIVE,
};



export function PlaceEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: existing, isLoading } = useAdminPlace(id);
  const createMut = useCreatePlace();
  const updateMut = useUpdatePlace();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [tab, setTab] = useState("general");

  // hydrate form when data loads
  useEffect(() => {
    if (!existing) return;
    const dec = (existing.decision ?? {}) as Partial<PlaceDecision>;
    const ex = existing as PlaceRow & {
      official_name?: string | null;
      country?: string | null;
      state?: string | null;
      city?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      market_segment?: string | null;
      investment_category?: string | null;
      development_stage?: string | null;
      average_price?: number | null;
      price_min?: number | null;
      price_max?: number | null;
      rental_yield?: number | null;
      absorption_rate?: number | null;
      vacancy_rate?: number | null;
      connectivity_summary?: string | null;
      employment_summary?: string | null;
      investment_outlook?: string | null;
      growth_outlook?: string | null;
      livability_outlook?: string | null;
      weaknesses?: string[] | null;
      recommendation?: string | null;
    };
    setForm({
      slug: existing.slug,
      name: existing.name,
      official_name: ex.official_name ?? "",
      region: existing.region,
      country: ex.country ?? "India",
      state: ex.state ?? "",
      city: ex.city ?? "",
      latitude: ex.latitude ?? null,
      longitude: ex.longitude ?? null,
      summary: existing.summary ?? "",
      status: (existing.status as PlaceStatus) ?? "draft",
      featured: existing.featured,
      risks: existing.risks ?? [],
      lifestyle: existing.lifestyle ?? [],
      education: existing.education ?? [],
      healthcare: existing.healthcare ?? [],
      growth_drivers: existing.growth_drivers ?? [],
      hero: (existing.hero ?? {}) as PlaceHero,
      seo: (existing.seo ?? {}) as PlaceSeo,
      metrics: (existing.metrics ?? {}) as PlaceMetrics,
      decision: {
        score: dec.score ?? 0,
        confidence: (dec.confidence as PlaceDecision["confidence"]) ?? "Medium",
        verdict: dec.verdict ?? "",
        categoryRatings:
          dec.categoryRatings && dec.categoryRatings.length ? dec.categoryRatings : DEFAULT_CATEGORIES,
      },
      market: {
        market_segment: ex.market_segment ?? null,
        investment_category: ex.investment_category ?? null,
        development_stage: ex.development_stage ?? null,
        average_price: ex.average_price ?? null,
        price_min: ex.price_min ?? null,
        price_max: ex.price_max ?? null,
        rental_yield: ex.rental_yield ?? null,
        absorption_rate: ex.absorption_rate ?? null,
        vacancy_rate: ex.vacancy_rate ?? null,
        connectivity_summary: ex.connectivity_summary ?? null,
        employment_summary: ex.employment_summary ?? null,
        investment_outlook: ex.investment_outlook ?? null,
        growth_outlook: ex.growth_outlook ?? null,
        livability_outlook: ex.livability_outlook ?? null,
      },
      narrative: {
        executive_summary: existing.executive_summary ?? "",
        highlights: existing.highlights ?? [],
        weaknesses: ex.weaknesses ?? [],
        opportunities: existing.opportunities ?? [],
        recommendation: ex.recommendation ?? null,
      },
    });
  }, [existing]);


  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const patchMarket = (p: Partial<MarketIntelligenceValues>) =>
    setForm((f) => ({ ...f, market: { ...f.market, ...p } }));
  const patchNarrative = (p: Partial<NarrativeValues>) =>
    setForm((f) => ({ ...f, narrative: { ...f.narrative, ...p } }));

  const computedScore = useMemo(
    () => computeDecisionScore(form.decision.categoryRatings),
    [form.decision.categoryRatings],
  );

  // keep decision.score in sync
  useEffect(() => {
    setForm((f) => ({ ...f, decision: { ...f.decision, score: computedScore } }));
  }, [computedScore]);

  const busy = createMut.isPending || updateMut.isPending;

  async function save(nextStatus: PlaceStatus) {
    if (!form.name.trim() || !form.slug.trim() || !form.region.trim()) {
      toast.error("Name, slug, and region are required.");
      setTab("general");
      return;
    }

    // Publish gate — validate before status flip
    if (nextStatus === "published" && id && existing) {
      const check = await checkPublishReadiness({
        ...(existing as PlaceRow),
        highlights: form.narrative.highlights,
        risks: form.risks,
        executive_summary: form.narrative.executive_summary,
      } as PlaceRow);
      if (!check.ok) {
        toast.error(`Cannot publish: ${check.failures[0]}`, {
          description: check.failures.slice(1, 4).join(" · "),
        });
        return;
      }
    }

    const payload = {
      slug: slugify(form.slug),
      name: form.name.trim(),
      official_name: form.official_name.trim() || null,
      region: form.region.trim(),
      country: form.country.trim() || "India",
      state: form.state.trim(),
      city: form.city.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      summary: form.summary,
      executive_summary: form.narrative.executive_summary,
      status: nextStatus,
      featured: form.featured,
      highlights: form.narrative.highlights.filter(Boolean),
      weaknesses: form.narrative.weaknesses.filter(Boolean),
      opportunities: form.narrative.opportunities.filter(Boolean),
      recommendation: form.narrative.recommendation,
      risks: form.risks.filter(Boolean),
      lifestyle: form.lifestyle.filter(Boolean),
      education: form.education.filter(Boolean),
      healthcare: form.healthcare.filter(Boolean),
      growth_drivers: form.growth_drivers.filter(Boolean),
      hero: form.hero as unknown as import("@/integrations/supabase/types").Json,
      seo: form.seo as unknown as import("@/integrations/supabase/types").Json,
      metrics: form.metrics as unknown as import("@/integrations/supabase/types").Json,
      decision: form.decision as unknown as import("@/integrations/supabase/types").Json,
      ...form.market,
    };


    try {
      if (id) {
        await updateMut.mutateAsync({ id, patch: payload });
        toast.success(labelFor(nextStatus));
      } else {
        const row = await createMut.mutateAsync(payload);
        toast.success(labelFor(nextStatus));
        navigate({ to: "/admin/places/$id", params: { id: row.id } });
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }


  if (id && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading place…
      </div>
    );
  }
  if (id && !isLoading && !existing) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-sm text-muted-foreground">Place not found.</p>
          <Link to="/admin/places" className="mt-3 inline-block text-sm text-accent">
            Back to Places
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/places"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Places
          </Link>
          <h1 className="mt-1 truncate text-2xl font-semibold text-foreground">
            {id ? form.name || "Untitled place" : "New Place"}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge status={form.status} />
            <span>Decision score: {computedScore.toFixed(1)}/10</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => save("draft")} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button variant="outline" onClick={() => save("review")} disabled={busy}>
            <Send className="mr-2 h-4 w-4" /> Submit for review
          </Button>
          <Button onClick={() => save("published")} disabled={busy}>
            <Globe className="mr-2 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50">
          {[
            ["general", "General"],
            ["location", "Location"],
            ["hero", "Hero"],
            ["decision", "Decision Score"],
            ["lifestyle", "Lifestyle"],
            ["education", "Education"],
            ["healthcare", "Healthcare"],
            ["growth", "Growth Drivers"],
            ["risks", "Risks"],
            ["media", "Media"],
            ["relationships", "Relationships"],
            ["seo", "SEO"],
          ].map(([v, l]) => (

            <TabsTrigger key={v} value={v}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <TextField label="Name" value={form.name} onChange={(v) => {
                patch("name", v);
                if (!id && !form.slug) patch("slug", slugify(v));
              }} />
              <TextField
                label="Slug"
                value={form.slug}
                onChange={(v) => patch("slug", slugify(v))}
                hint="URL identifier, e.g. new-chandigarh"
              />
              <TextField label="Region" value={form.region} onChange={(v) => patch("region", v)} />
              <Field label="Featured">
                <div className="flex h-10 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => patch("featured", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-muted-foreground">Show on homepage</span>
                </div>
              </Field>
              <div className="md:col-span-2">
                <TextareaField
                  label="Short summary"
                  rows={2}
                  value={form.summary}
                  onChange={(v) => patch("summary", v)}
                  hint="1–2 sentences shown in list previews."
                />
              </div>
              <div className="md:col-span-2 grid gap-4 sm:grid-cols-4">
                <TextField
                  label="Population"
                  value={form.metrics.population ?? ""}
                  onChange={(v) => patch("metrics", { ...form.metrics, population: v })}
                />
                <TextField
                  label="Avg price / sqft"
                  value={form.metrics.avgPricePerSqft ?? ""}
                  onChange={(v) => patch("metrics", { ...form.metrics, avgPricePerSqft: v })}
                />
                <NumberField
                  label="Active projects"
                  value={form.metrics.activeProjects ?? 0}
                  onChange={(v) => patch("metrics", { ...form.metrics, activeProjects: v })}
                />
                <NumberField
                  label="Verified builders"
                  value={form.metrics.verifiedBuilders ?? 0}
                  onChange={(v) => patch("metrics", { ...form.metrics, verifiedBuilders: v })}
                />
              </div>
              <div className="md:col-span-2 rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Executive summary, strengths, weaknesses and recommendation now live in the{" "}
                <button type="button" className="text-accent underline" onClick={() => setTab("narrative")}>
                  Narrative
                </button>{" "}
                tab.
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <TextField label="Country" value={form.country} onChange={(v) => patch("country", v)} />
              <TextField label="State" value={form.state} onChange={(v) => patch("state", v)} />
              <TextField label="City" value={form.city} onChange={(v) => patch("city", v)} />
              <div />
              <NumberField
                label="Latitude"
                value={form.latitude ?? 0}
                step={0.000001}
                onChange={(v) => patch("latitude", Number.isFinite(v) ? v : null)}
                hint="Optional"
              />
              <NumberField
                label="Longitude"
                value={form.longitude ?? 0}
                step={0.000001}
                onChange={(v) => patch("longitude", Number.isFinite(v) ? v : null)}
                hint="Optional"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="mt-6">
          <Card>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <TextField
                  label="Headline"
                  value={form.hero.headline ?? ""}
                  onChange={(v) => patch("hero", { ...form.hero, headline: v })}
                />
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  label="Subheadline"
                  rows={3}
                  value={form.hero.subheadline ?? ""}
                  onChange={(v) => patch("hero", { ...form.hero, subheadline: v })}
                />
              </div>
              <TextField
                label="Tagline"
                value={form.hero.tagline ?? ""}
                onChange={(v) => patch("hero", { ...form.hero, tagline: v })}
              />
              <TextField
                label="Hero image URL"
                value={form.hero.heroImageUrl ?? ""}
                onChange={(v) => patch("hero", { ...form.hero, heroImageUrl: v })}
                hint="Or upload in the Media tab and paste the public URL."
              />
              <TextField
                label="Cover image URL"
                value={form.hero.coverImageUrl ?? ""}
                onChange={(v) => patch("hero", { ...form.hero, coverImageUrl: v })}
                hint="Featured thumbnail used in listings and share previews."
              />
              {form.hero.coverImageUrl ? (
                <div className="md:col-span-2">
                  <img
                    src={form.hero.coverImageUrl}
                    alt="Cover preview"
                    className="max-h-48 rounded-md border border-border object-cover"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="decision" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Decision Score</CardTitle>
              <p className="text-xs text-muted-foreground">
                The final score is computed as the average of category scores.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Computed score
                  </span>
                  <span className="text-3xl font-semibold text-foreground">
                    {computedScore.toFixed(1)}
                    <span className="text-base text-muted-foreground">/10</span>
                  </span>
                </div>
                <Progress value={computedScore * 10} className="mt-3" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Confidence">
                  <Select
                    value={form.decision.confidence}
                    onValueChange={(v) =>
                      patch("decision", { ...form.decision, confidence: v as PlaceDecision["confidence"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div />
                <div className="md:col-span-2">
                  <TextareaField
                    label="Verdict"
                    rows={3}
                    value={form.decision.verdict}
                    onChange={(v) => patch("decision", { ...form.decision, verdict: v })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Category scores</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch("decision", {
                        ...form.decision,
                        categoryRatings: [...form.decision.categoryRatings, { label: "", score: 7 }],
                      })
                    }
                  >
                    Add category
                  </Button>
                </div>
                {form.decision.categoryRatings.map((c: CategoryScore, i) => (
                  <div key={i} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_2fr_auto]">
                    <input
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={c.label}
                      placeholder="Category label"
                      onChange={(e) => {
                        const next = [...form.decision.categoryRatings];
                        next[i] = { ...c, label: e.target.value };
                        patch("decision", { ...form.decision, categoryRatings: next });
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <Slider
                        min={0}
                        max={10}
                        step={0.1}
                        value={[c.score]}
                        onValueChange={([v]) => {
                          const next = [...form.decision.categoryRatings];
                          next[i] = { ...c, score: v };
                          patch("decision", { ...form.decision, categoryRatings: next });
                        }}
                      />
                      <span className="w-12 text-right text-sm text-foreground">
                        {c.score.toFixed(1)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        patch("decision", {
                          ...form.decision,
                          categoryRatings: form.decision.categoryRatings.filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="mt-6">
          <SectionListCard
            title="Lifestyle Overview"
            hint="Neighborhood character, dining, culture, retail."
            items={form.lifestyle}
            onChange={(v) => patch("lifestyle", v)}
          />
        </TabsContent>
        <TabsContent value="education" className="mt-6">
          <SectionListCard
            title="Education"
            hint="Schools, colleges, learning ecosystem."
            items={form.education}
            onChange={(v) => patch("education", v)}
          />
        </TabsContent>
        <TabsContent value="healthcare" className="mt-6">
          <SectionListCard
            title="Healthcare"
            hint="Hospitals and medical infrastructure."
            items={form.healthcare}
            onChange={(v) => patch("healthcare", v)}
          />
        </TabsContent>
        <TabsContent value="growth" className="mt-6">
          <SectionListCard
            title="Growth Drivers"
            items={form.growth_drivers}
            onChange={(v) => patch("growth_drivers", v)}
          />
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <SectionListCard
            title="Risks & Considerations"
            items={form.risks}
            onChange={(v) => patch("risks", v)}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaPanel placeId={id} onQueryInvalidate={() => qc.invalidateQueries({ queryKey: ["entity_images"] })} />
        </TabsContent>

        <TabsContent value="relationships" className="mt-6">
          {id ? (
            <RelationshipsTab entity={{ type: "place", id }} />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Save this place first to manage relationships.
              </CardContent>
            </Card>
          )}
        </TabsContent>


        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardContent className="grid gap-5 p-6">
              <SeoTextField
                label="Meta title"
                value={form.seo.title ?? ""}
                onChange={(v) => patch("seo", { ...form.seo, title: v })}
                limit={60}
              />
              <SeoTextareaField
                label="Meta description"
                value={form.seo.description ?? ""}
                onChange={(v) => patch("seo", { ...form.seo, description: v })}
                limit={160}
              />
              <TextField
                label="Keywords"
                value={form.seo.keywords ?? ""}
                onChange={(v) => patch("seo", { ...form.seo, keywords: v })}
                hint="Comma-separated."
              />
              <TextField
                label="Canonical URL"
                value={form.seo.canonicalUrl ?? ""}
                onChange={(v) => patch("seo", { ...form.seo, canonicalUrl: v })}
                placeholder="https://nesthunt.in/places/your-slug"
              />
              <div className="border-t border-border pt-4">
                <h3 className="mb-4 text-sm font-medium text-foreground">Open Graph</h3>
                <div className="grid gap-5">
                  <SeoTextField
                    label="OG title"
                    value={form.seo.ogTitle ?? ""}
                    onChange={(v) => patch("seo", { ...form.seo, ogTitle: v })}
                    limit={70}
                  />
                  <SeoTextareaField
                    label="OG description"
                    value={form.seo.ogDescription ?? ""}
                    onChange={(v) => patch("seo", { ...form.seo, ogDescription: v })}
                    limit={200}
                  />
                  <TextField
                    label="OG image URL"
                    value={form.seo.ogImage ?? ""}
                    onChange={(v) => patch("seo", { ...form.seo, ogImage: v })}
                    hint="Defaults to the cover image if empty."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function labelFor(s: PlaceStatus) {
  return s === "published" ? "Published" : s === "review" ? "Submitted for review" : "Draft saved";
}

function SectionListCard({
  title,
  hint,
  items,
  onChange,
}: {
  title: string;
  hint?: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <StringListField label="" items={items} onChange={onChange} placeholder="Add an insight…" />
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-success/10 text-success",
    review: "bg-warning/10 text-warning",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}

function MediaPanel({
  placeId,
  onQueryInvalidate,
}: {
  placeId?: string;
  onQueryInvalidate: () => void;
}) {
  const { data: images = [], refetch } = useEntityImages("place", placeId);
  const [uploading, setUploading] = useState(false);

  if (!placeId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Save the place as a draft first, then you can upload images.
        </CardContent>
      </Card>
    );
  }

  async function handleFile(files: FileList | null) {
    if (!files || !files.length || !placeId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = await uploadMedia(file, "place", placeId);
        await addEntityImage("place", placeId, path, file.name, images.length);
      }
      await refetch();
      onQueryInvalidate();
      toast.success("Uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Media</CardTitle>
        <p className="text-xs text-muted-foreground">
          Images stored in the entity-media bucket and linked to this place.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-8 text-sm text-muted-foreground hover:bg-muted/40">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{uploading ? "Uploading…" : "Click to upload images"}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-md border border-border">
              <img
                src={getPublicUrl(img.storagePath)}
                alt={img.alt}
                className="aspect-square w-full object-cover"
              />
              <button
                className="absolute right-1 top-1 rounded-md bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={async () => {
                  try {
                    await removeEntityImage(img.id, img.storagePath);
                    await refetch();
                    toast.success("Removed");
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
                aria-label="Remove image"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SeoTextField({
  label,
  value,
  onChange,
  limit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limit: number;
}) {
  const over = value.length > limit;
  return (
    <Field
      label={label}
      hint={`${value.length}/${limit}${over ? " — over recommended limit" : ""}`}
    >
      <input
        className={`h-10 w-full rounded-md border bg-background px-3 text-sm ${over ? "border-warning" : "border-input"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function SeoTextareaField({
  label,
  value,
  onChange,
  limit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limit: number;
}) {
  const over = value.length > limit;
  return (
    <Field
      label={label}
      hint={`${value.length}/${limit}${over ? " — over recommended limit" : ""}`}
    >
      <textarea
        rows={3}
        className={`w-full rounded-md border bg-background p-3 text-sm ${over ? "border-warning" : "border-input"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
