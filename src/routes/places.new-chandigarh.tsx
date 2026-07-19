import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  MapPin,
  TrendingUp,
  Shield,
  Building2,
  GraduationCap,
  Heart,
  Trees,
  ShoppingBag,
  Film,
  Coffee,
  CheckCircle2,
  Clock,
  CalendarClock,
  Construction,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Hospital,
  Landmark,
  Route as RouteIcon,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlace } from "@/hooks/useNestHunt";


export const Route = createFileRoute("/places/new-chandigarh")({
  head: () => ({
    meta: [
      { title: "New Chandigarh — Place Intelligence Report | NestHunt" },
      {
        name: "description",
        content:
          "Independent decision report on New Chandigarh: infrastructure, livability, growth drivers, risks and featured projects.",
      },
      { property: "og:title", content: "New Chandigarh — NestHunt" },
      {
        property: "og:description",
        content:
          "Should you invest or live in New Chandigarh? A structured, verified place intelligence report.",
      },
    ],
  }),
  component: PlacePage,
});

/* ------------------------------- Mock Data ------------------------------- */

const TAGS = ["Planned City", "Emerging Growth", "Residential"];

const SNAPSHOT = [
  { label: "Builder Confidence", value: "High", tone: "positive" as const },
  { label: "Infrastructure", value: "Excellent", tone: "positive" as const },
  { label: "Legal Transparency", value: "Good", tone: "neutral" as const },
  { label: "Investment Potential", value: "High", tone: "positive" as const },
];

const METRICS = [
  { label: "Average Price", value: "₹7,800", hint: "per sq ft" },
  { label: "Price Trend", value: "Rising", hint: "12-month direction" },
  { label: "Connectivity", value: "8.8", hint: "out of 10" },
  { label: "Livability", value: "8.5", hint: "out of 10" },
  { label: "Infrastructure", value: "9.2", hint: "out of 10" },
  { label: "Safety", value: "8.4", hint: "out of 10" },
];

type TimelineStatus =
  | "Completed"
  | "In Progress"
  | "Planned"
  | "Under Development"
  | "Future Proposal";

const TIMELINE: {
  title: string;
  status: TimelineStatus;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    title: "Road expansion",
    status: "Completed",
    detail: "Widening of arterial roads and internal sector connectors.",
    icon: RouteIcon,
  },
  {
    title: "New school development",
    status: "In Progress",
    detail: "Multiple K-12 campuses under construction across sectors.",
    icon: GraduationCap,
  },
  {
    title: "Healthcare expansion",
    status: "Planned",
    detail: "Additional multi-speciality facilities on the master plan.",
    icon: Hospital,
  },
  {
    title: "Commercial district",
    status: "Under Development",
    detail: "Mixed-use commercial hub in structured phases.",
    icon: Building2,
  },
  {
    title: "Metro connectivity",
    status: "Future Proposal",
    detail: "Long-term proposal linking the township to Chandigarh & Mohali.",
    icon: RouteIcon,
  },
];

const STATUS_STYLES: Record<TimelineStatus, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  "In Progress": "bg-accent/10 text-accent border-accent/20",
  Planned: "bg-muted text-muted-foreground border-border",
  "Under Development": "bg-warning/10 text-warning border-warning/20",
  "Future Proposal": "bg-muted text-muted-foreground border-border",
};

const STATUS_ICON: Record<
  TimelineStatus,
  React.ComponentType<{ className?: string }>
> = {
  Completed: CheckCircle2,
  "In Progress": Clock,
  Planned: CalendarClock,
  "Under Development": Construction,
  "Future Proposal": CalendarClock,
};

const LIFESTYLE = [
  {
    icon: Trees,
    title: "Green Spaces",
    description:
      "Landscaped parks and open sectors woven into the master plan for daily outdoor use.",
  },
  {
    icon: ShoppingBag,
    title: "Shopping",
    description:
      "Neighborhood retail with an expanding commercial district for larger formats.",
  },
  {
    icon: Film,
    title: "Entertainment",
    description:
      "Multiplexes, dining, and entertainment options within a short drive to Chandigarh.",
  },
  {
    icon: Coffee,
    title: "Daily Convenience",
    description:
      "Grocery, pharmacies, and everyday services concentrated near residential clusters.",
  },
];

const EDUCATION = [
  "Government Schools",
  "Private Schools",
  "Engineering Colleges",
  "Universities",
];

const HEALTHCARE = [
  "Multi-speciality Hospitals",
  "Clinics",
  "Emergency Care",
  "Diagnostic Centres",
];

const GROWTH_DRIVERS = [
  {
    title: "Strategic location",
    detail: "Positioned along the Chandigarh–Mohali growth corridor.",
  },
  {
    title: "Government planning",
    detail: "Master-planned under GMADA with structured zoning norms.",
  },
  {
    title: "Improving infrastructure",
    detail: "Continued upgrades to roads, utilities and civic amenities.",
  },
  {
    title: "Growing residential demand",
    detail: "Spillover demand from Chandigarh and Mohali households.",
  },
  {
    title: "Commercial expansion",
    detail: "Emerging commercial district anchoring long-term employment.",
  },
];

const RISKS = [
  "Some sectors are still developing.",
  "Public transport continues to improve.",
  "Commercial activity is concentrated in selected areas.",
  "Construction activity remains active.",
];

const PROJECTS = [
  {
    name: "Hero Homes",
    builder: "Hero Realty",
    config: "2, 3 & 4 BHK",
    price: "₹1.1 Cr – ₹2.4 Cr",
    status: "Under Construction",
    href: "/project/hero-homes",
  },
  {
    name: "Omaxe New Chandigarh",
    builder: "Omaxe",
    config: "Plots, 3 & 4 BHK",
    price: "₹95 L – ₹3.1 Cr",
    status: "Selling",
    href: "/builder/omaxe",
  },
  {
    name: "DLF Valley",
    builder: "DLF",
    config: "3 & 4 BHK Villas",
    price: "₹1.6 Cr – ₹3.8 Cr",
    status: "Ready to Move",
    href: "#",
  },
];

const QUICK_FACTS = [
  { label: "Average Price", value: "₹7,800 / sq ft" },
  { label: "Connectivity", value: "8.8 / 10" },
  { label: "Builder Confidence", value: "High" },
  { label: "Investment Rating", value: "Strong" },
];

/* -------------------------------- Component ------------------------------ */

function PlacePage() {
  const { data: place, isLoading } = usePlace("new-chandigarh");
  if (isLoading || !place) {
    return (
      <AppLayout>
        <Container>
          <div className="py-24 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading place…" : "Place not found."}
          </div>
        </Container>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 py-4 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span>Places</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground">New Chandigarh</span>
          </nav>
        </Container>
      </div>

      {/* Hero */}
      <div className="border-b border-border bg-surface">
        <Container>
          <div className="py-12 sm:py-16">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {place.region}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {place.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {place.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(place.highlights.length ? place.highlights : TAGS).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main + Sidebar layout */}
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
          <div className="min-w-0 space-y-16">
            {/* Executive Summary */}
            <section aria-labelledby="exec-summary">
              <SectionHeading id="exec-summary" eyebrow="01 · Overview">
                Executive summary
              </SectionHeading>
              <Card className="mt-6 rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-base leading-relaxed text-foreground">
                    {place.executiveSummary}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Decision Snapshot */}
            <section aria-labelledby="decision-snapshot">
              <SectionHeading id="decision-snapshot" eyebrow="02 · Decision">
                Decision snapshot
              </SectionHeading>
              <Card className="mt-6 rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Decision Score
                      </p>
                      <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-foreground">
                        82
                        <span className="ml-1 text-xl font-normal text-muted-foreground">
                          / 100
                        </span>
                      </p>
                    </div>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Composite score based on infrastructure, livability,
                      builder confidence and long-term investment potential.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SNAPSHOT.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {s.label}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              s.tone === "positive" && "bg-success",
                              s.tone === "neutral" && "bg-accent",
                            )}
                          />
                          <p className="text-sm font-semibold text-foreground">
                            {s.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Card className="rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Decision Score
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                    82
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      / 100
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confidence: High
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Quick Facts
                  </p>
                  <dl className="mt-4 space-y-3">
                    {QUICK_FACTS.map((f) => (
                      <div
                        key={f.label}
                        className="flex items-baseline justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <dt className="text-xs text-muted-foreground">
                          {f.label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
              <Button asChild className="w-full">
                <Link to="/project/hero-homes">Explore projects</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Container>

      {/* Key Intelligence Metrics — alt bg */}
      <Section className="bg-muted/40 border-y border-border">
        <SectionHeading eyebrow="03 · Metrics">
          Key intelligence metrics
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m) => (
            <Card
              key={m.label}
              className="rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {m.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Infrastructure Timeline */}
      <Section>
        <SectionHeading eyebrow="04 · Infrastructure">
          Infrastructure timeline
        </SectionHeading>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <ol className="relative space-y-6 border-l border-border pl-6">
            {TIMELINE.map((item) => {
              const StatusIcon = STATUS_ICON[item.status];
              const Icon = item.icon;
              return (
                <li key={item.title} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-muted-foreground"
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLES[item.status],
                      )}
                    >
                      <StatusIcon className="h-3 w-3" aria-hidden />
                      {item.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* Lifestyle — alt bg */}
      <Section className="bg-muted/40 border-y border-border">
        <SectionHeading eyebrow="05 · Lifestyle">
          Lifestyle overview
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LIFESTYLE.map((l) => {
            const Icon = l.icon;
            return (
              <Card
                key={l.title}
                className="rounded-xl border-border bg-surface shadow-none"
              >
                <CardContent className="p-6">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {l.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {l.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Education & Healthcare */}
      <Section>
        <SectionHeading eyebrow="06 · Institutions">
          Education & healthcare
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <TwoColumnListCard
            icon={<GraduationCap className="h-4 w-4" />}
            title="Education"
            items={EDUCATION}
          />
          <TwoColumnListCard
            icon={<Heart className="h-4 w-4" />}
            title="Healthcare"
            items={HEALTHCARE}
          />
        </div>
      </Section>

      {/* Growth Drivers — alt bg */}
      <Section className="bg-muted/40 border-y border-border">
        <SectionHeading eyebrow="07 · Tailwinds">
          Growth drivers
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GROWTH_DRIVERS.map((g) => (
            <Card
              key={g.title}
              className="rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Driver
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                  {g.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {g.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Risks */}
      <Section>
        <SectionHeading eyebrow="08 · Reality check">
          Risks & considerations
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          We surface honest considerations so decisions stay grounded. None of
          the items below are dealbreakers on their own — they are context.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {RISKS.map((r) => (
            <Card
              key={r}
              className="rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="flex items-start gap-3 p-5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-warning/10 text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm leading-relaxed text-foreground">{r}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Featured Projects — alt bg */}
      <Section className="bg-muted/40 border-y border-border">
        <SectionHeading eyebrow="09 · Projects">
          Featured projects
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <Card
              key={p.name}
              className="flex h-full flex-col rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-foreground">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                    {p.status}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {p.name}
                </h3>
                <p className="text-sm text-muted-foreground">by {p.builder}</p>
                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Configuration</dt>
                    <dd className="text-right font-medium text-foreground">
                      {p.config}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="text-right font-medium text-foreground">
                      {p.price}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex-1" />
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link to={p.href}>
                    View Details
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <Card className="rounded-2xl border-border bg-foreground text-background shadow-none">
          <CardContent className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Next step
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to explore projects in New Chandigarh?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-background/70">
                Compare shortlisted projects and localities side-by-side with
                verified data.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-accent text-foreground hover:bg-accent/90"
              >
                <Link to="/project/hero-homes">Explore Projects</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/journey">Compare Localities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Legal footnote / Shield */}
      <Section className="pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          Data compiled from public sources and NestHunt research. Verify
          independently before any transaction.
        </div>
      </Section>
    </AppLayout>
  );
}

/* --------------------------------- Bits ---------------------------------- */

function SectionHeading({
  id,
  eyebrow,
  children,
}: {
  id?: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        {children}
      </h2>
    </div>
  );
}

function TwoColumnListCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <Card className="rounded-xl border-border bg-surface shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-muted text-foreground">
            {icon}
          </span>
          <h3 className="font-display text-base font-semibold text-foreground">
            {title}
          </h3>
        </div>
        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
              {i}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
