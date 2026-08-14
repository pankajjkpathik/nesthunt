import { Building2, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAdminSession } from "@/hooks/useAdmin";
import type { BuilderRow, BuilderHero as BuilderHeroMeta, TrustBreakdownEntry } from "@/lib/services/builders-admin";
import { DecisionScoreCard } from "@/components/common/DecisionScoreCard";

interface Props {
  builder: BuilderRow;
}

const NA = "Not Available";

function toCount(value: unknown): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return NA;
  return String(n);
}

export function BuilderHero({ builder }: Props) {
  const navigate = useNavigate();
  const { signedIn } = useAdminSession();

  const hero = (builder.hero ?? {}) as BuilderHeroMeta;
  const metrics = (builder.metrics ?? {}) as Record<string, unknown>;
  const trustBreakdown = (builder.trust_breakdown as unknown as TrustBreakdownEntry[]) ?? [];

  const logoUrl = hero.logoUrl;
  const headquarters = builder.head_office || builder.headquarters || null;
  const established = builder.year_established ?? null;
  const yearsInBusiness =
    builder.years_active ??
    (established ? new Date().getFullYear() - established : null);

  const segments = Array.isArray(metrics.segments)
    ? (metrics.segments as string[])
    : builder.builder_type
      ? [builder.builder_type]
      : [];

  const kpis = [
    { label: "Projects Completed", value: toCount(metrics.completedProjects) },
    { label: "Projects Ongoing", value: toCount(metrics.ongoingProjects) },
    { label: "Cities Served", value: toCount(metrics.citiesServed) },
    {
      label: "Years in Business",
      value: yearsInBusiness ? String(yearsInBusiness) : NA,
    },
  ];

  const showTrustScore = builder.trust_score !== null && trustBreakdown.length > 0;

  function handleViewProjects() {
    document
      .getElementById("portfolio")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSave() {
    if (!signedIn) {
      void navigate({ to: "/admin/login" });
      return;
    }
    toast.success(`${builder.name} saved to your journey`);
  }

  return (
    <section aria-labelledby="builder-hero-heading" className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${builder.name} logo`}
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Building2 className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Builder Intelligence
            </p>
            <h1
              id="builder-hero-heading"
              className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {builder.name}
            </h1>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Headquarters
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {headquarters ?? NA}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Established
            </dt>
            <dd className="mt-1 text-sm text-foreground">{established ?? NA}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Years in Business
            </dt>
            <dd className="mt-1 text-sm text-foreground">{yearsInBusiness ?? NA}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Property Segments
            </dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {segments.length ? (
                segments.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-foreground">{NA}</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="min-w-0 space-y-6">
        {showTrustScore ? (
          <DecisionScoreCard
            title="Builder Trust Score"
            score={builder.trust_score!}
            confidence="High"
            categoryRatings={trustBreakdown}
            className="border-border shadow-sm"
          />
        ) : (
          <Card className="border-border border-dashed bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-4 font-display text-lg font-semibold text-foreground">
                Assessment Pending
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verification of this builder's credentials is in progress.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-border bg-surface">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {kpi.value === NA ? (
                    <span className="text-base font-medium text-muted-foreground">{NA}</span>
                  ) : (
                    kpi.value
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button className="w-full sm:w-auto" onClick={handleViewProjects}>
            View Projects
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto" disabled>
                    Compare
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming Soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" className="w-full sm:w-auto" onClick={handleSave}>
            Save Builder
          </Button>
        </div>
      </div>
    </section>
  );
}
