import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPinned,
  TrainFront,
  Scale,
  Compass,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { usePlaces, useBuilders, useProjects } from "@/hooks/useNestHunt";


export const Route = createFileRoute("/")({
  component: HomePage,
});

const TRUST_ITEMS = [
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Verified RERA Information",
    description:
      "Every builder and project is cross-checked against official RERA registrations.",
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: "Builder Track Record",
    description:
      "Historical delivery, financial signals, and post-possession performance in one view.",
  },
  {
    icon: <MapPinned className="h-4 w-4" />,
    title: "Locality Intelligence",
    description:
      "Structured neighbourhood insights across livability, schools, and healthcare.",
  },
  {
    icon: <TrainFront className="h-4 w-4" />,
    title: "Infrastructure Insights",
    description:
      "Master plans, metro corridors, and connectivity signals mapped to each place.",
  },
  {
    icon: <Scale className="h-4 w-4" />,
    title: "Transparent Comparisons",
    description:
      "Compare projects side-by-side on the dimensions that actually matter.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Discover",
    description: "Explore verified places, builders, and projects.",
  },
  {
    n: "02",
    title: "Evaluate",
    description: "Understand risks, opportunities, and growth potential.",
  },
  {
    n: "03",
    title: "Decide",
    description: "Make your property decision with confidence.",
  },
];

const INTELLIGENCE_META = {
  place: {
    icon: <Compass className="h-4 w-4" />,
    title: "Place Intelligence",
    fallback:
      "Understand neighbourhood growth, connectivity, schools, healthcare, and infrastructure.",
    ctaLabel: "Explore Place",
  },
  builder: {
    icon: <Building2 className="h-4 w-4" />,
    title: "Builder Intelligence",
    fallback:
      "Evaluate builder credibility, delivery history, and customer trust.",
    ctaLabel: "Explore Builder",
  },
  project: {
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Project Intelligence",
    fallback:
      "Compare amenities, legal status, pricing, and long-term potential.",
    ctaLabel: "Explore Project",
  },
} as const;


function HomePage() {
  return (
    <AppLayout>
      {/* Hero */}
      <Container>
        <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-32">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Property Decision Intelligence
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Know the truth behind every property before you invest.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              NestHunt helps you make confident property decisions by combining
              verified builder information, locality intelligence, infrastructure
              insights, legal transparency, and structured comparisons—all in
              one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/places/new-chandigarh">
                  Explore Places
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </Container>

      {/* Trust */}
      <Section className="border-t border-border bg-surface">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Why people trust NestHunt
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Independent, evidence-first intelligence for one of life's biggest
            decisions.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_ITEMS.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
                {s.icon}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works" className="border-t border-border">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A structured path from exploration to a decision you can defend.
          </p>
        </div>
        <ol className="relative grid gap-4 sm:grid-cols-3">
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-11 hidden h-px bg-border sm:block"
          />
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="relative rounded-xl border border-border bg-surface p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background font-display text-sm font-semibold text-foreground">
                {step.n}
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Featured intelligence */}
      <Section className="border-t border-border bg-surface">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Explore Decision Intelligence
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three complementary lenses on every property decision.
          </p>
        </div>
        <FeaturedIntelligence />
      </Section>


      {/* Social proof */}
      <Section className="border-t border-border">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built for thoughtful buyers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Whether you're buying your first home, investing for the future, or
            comparing multiple projects, NestHunt helps you make better
            decisions with structured information instead of marketing claims.
          </p>
        </div>
      </Section>
    </AppLayout>
  );
}

type IntelKey = keyof typeof INTELLIGENCE_META;

function FeaturedIntelligence() {
  const places = usePlaces({ featuredOnly: true });
  const builders = useBuilders({ featuredOnly: true });
  const projects = useProjects({ featuredOnly: true });

  const cards: Array<{
    key: IntelKey;
    href: string | null;
    heading: string;
    description: string;
    loading: boolean;
    error: boolean;
  }> = [
    {
      key: "place",
      href: places.data?.[0] ? `/places/${places.data[0].slug}` : null,
      heading: places.data?.[0]?.name ?? INTELLIGENCE_META.place.title,
      description: places.data?.[0]?.summary ?? INTELLIGENCE_META.place.fallback,
      loading: places.isLoading,
      error: !!places.error,
    },
    {
      key: "builder",
      href: builders.data?.[0] ? `/builder/${builders.data[0].slug}` : null,
      heading: builders.data?.[0]?.name ?? INTELLIGENCE_META.builder.title,
      description: builders.data?.[0]?.summary ?? INTELLIGENCE_META.builder.fallback,
      loading: builders.isLoading,
      error: !!builders.error,
    },
    {
      key: "project",
      href: projects.data?.[0] ? `/project/${projects.data[0].slug}` : null,
      heading: projects.data?.[0]?.name ?? INTELLIGENCE_META.project.title,
      description: projects.data?.[0]?.summary ?? INTELLIGENCE_META.project.fallback,
      loading: projects.isLoading,
      error: !!projects.error,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {cards.map((card) => {
        const meta = INTELLIGENCE_META[card.key];
        return (
          <div
            key={card.key}
            className="flex flex-col rounded-xl border border-border bg-background p-8"
          >
            <div className="grid h-10 w-10 place-items-center rounded-md bg-muted text-muted-foreground">
              {meta.icon}
            </div>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {meta.title}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
              {card.loading ? "Loading…" : card.error ? "Unavailable" : card.heading}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {card.error
                ? "We couldn't load this intelligence right now. Please try again shortly."
                : card.description}
            </p>
            <div className="mt-6">
              {card.href ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 px-0 hover:bg-transparent"
                  asChild
                >
                  <a href={card.href}>
                    {meta.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {card.loading ? "Fetching latest reports…" : "No featured entries yet"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

  return (
    <div aria-hidden className="relative">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        {/* Chrome */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            NestHunt · Decision Intelligence
          </p>
        </div>

        {/* Headline score */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Decision Score
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
              82
              <span className="ml-1 text-base font-normal text-muted-foreground">
                / 100
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            High confidence
          </span>
        </div>

        {/* KPI grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <KpiTile
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Builder Trust"
            value="9.1"
            hint="/ 10"
          />
          <KpiTile
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Infrastructure Growth"
            value="High"
          />
          <KpiTile
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Legal Risk"
            value="Low"
          />
          <KpiTile
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            label="Expected Appreciation"
            value="+18%"
            hint="3-yr"
          />
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
        {value}
        {hint && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </p>
    </div>
  );
}
