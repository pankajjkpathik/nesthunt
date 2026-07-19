import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Building2,
  ShieldCheck,
  Landmark,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  CalendarClock,
  Construction,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Star,
  Wallet,
  MessageSquare,
  Wrench,
  BadgeCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/builder/omaxe")({
  head: () => ({
    meta: [
      { title: "Omaxe — Builder Intelligence Report | NestHunt" },
      {
        name: "description",
        content:
          "Independent trust report on Omaxe: delivery history, portfolio, customer experience, strengths and risks.",
      },
      { property: "og:title", content: "Omaxe — NestHunt" },
      {
        property: "og:description",
        content:
          "Can you trust this builder? A structured, balanced intelligence report on Omaxe.",
      },
    ],
  }),
  component: BuilderPage,
});

/* ------------------------------- Mock Data ------------------------------- */

const TAGS = ["National Developer", "Townships", "Residential", "Commercial"];

const TRUST_INDICATORS = [
  { label: "Delivery Record", value: "Good", tone: "positive" as const },
  { label: "Legal Transparency", value: "Good", tone: "positive" as const },
  {
    label: "Customer Satisfaction",
    value: "Moderate",
    tone: "neutral" as const,
  },
  { label: "Financial Stability", value: "Strong", tone: "positive" as const },
  { label: "Experience", value: "30+ Years", tone: "positive" as const },
];

const COMPANY = [
  { label: "Founded", value: "1989" },
  { label: "Headquarters", value: "New Delhi, India" },
  { label: "Operating Cities", value: "27" },
  { label: "Completed Projects", value: "132" },
  { label: "Projects Under Development", value: "24" },
  {
    label: "Business Segments",
    value: "Residential · Commercial · Townships",
  },
];

const PERFORMANCE = [
  { label: "Years in Business", value: "36" },
  { label: "Projects Delivered", value: "132" },
  { label: "Cities Served", value: "27" },
  { label: "Ongoing Projects", value: "24" },
  { label: "Estimated Delivery Reliability", value: "78%" },
  { label: "Overall Market Presence", value: "National" },
];

type DeliveryStatus =
  | "Delivered"
  | "Delivered with Delay"
  | "Under Construction"
  | "Upcoming";

const DELIVERY: {
  name: string;
  status: DeliveryStatus;
  detail: string;
}[] = [
  {
    name: "Residential Township A",
    status: "Delivered",
    detail: "Handover completed on schedule with full amenities operational.",
  },
  {
    name: "Commercial Project B",
    status: "Delivered with Delay",
    detail: "Delivered ~14 months past original commitment date.",
  },
  {
    name: "Integrated Township C",
    status: "Under Construction",
    detail: "Multiple towers in advanced structural stage.",
  },
  {
    name: "Luxury Project D",
    status: "Upcoming",
    detail: "Announced launch pipeline for the next fiscal year.",
  },
];

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  Delivered: "bg-success/10 text-success border-success/20",
  "Delivered with Delay": "bg-warning/10 text-warning border-warning/20",
  "Under Construction": "bg-accent/10 text-accent border-accent/20",
  Upcoming: "bg-muted text-muted-foreground border-border",
};

const STATUS_ICON: Record<
  DeliveryStatus,
  React.ComponentType<{ className?: string }>
> = {
  Delivered: CheckCircle2,
  "Delivered with Delay": Clock,
  "Under Construction": Construction,
  Upcoming: CalendarClock,
};

const PORTFOLIO = [
  {
    name: "Omaxe New Chandigarh",
    city: "New Chandigarh",
    category: "Township",
    status: "Selling",
    price: "₹95 L",
    href: "/project/hero-homes",
  },
  {
    name: "Omaxe Connaught Place",
    city: "Greater Noida",
    category: "Commercial",
    status: "Delivered",
    price: "₹1.2 Cr",
    href: "#",
  },
  {
    name: "Omaxe Heights",
    city: "Faridabad",
    category: "Residential",
    status: "Ready to Move",
    price: "₹78 L",
    href: "#",
  },
  {
    name: "Omaxe World Street",
    city: "Faridabad",
    category: "Mixed-Use",
    status: "Under Construction",
    price: "₹65 L",
    href: "#",
  },
];

const EXPERIENCE = [
  {
    icon: Wrench,
    title: "Construction Quality",
    rating: 8.2,
    detail:
      "Generally consistent build quality across delivered residential projects.",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    rating: 7.4,
    detail:
      "Structured pre-sale communication; post-sale response times can vary.",
  },
  {
    icon: BadgeCheck,
    title: "After-Sales Support",
    rating: 7.0,
    detail:
      "Documented handover process; maintenance responsiveness varies by site.",
  },
  {
    icon: Wallet,
    title: "Value for Money",
    rating: 7.8,
    detail: "Competitive pricing for the segment given brand and land bank.",
  },
];

const STRENGTHS = [
  "Large land bank",
  "Diversified portfolio",
  "Strong brand recognition",
  "Township experience",
];

const RISKS = [
  "Delivery timelines may vary by project.",
  "Review individual RERA registrations.",
  "Verify payment schedules.",
  "Understand maintenance commitments.",
];

const SIDEBAR = [
  { label: "Trust Score", value: "8.8 / 10" },
  { label: "Years in Business", value: "36" },
  { label: "Projects Delivered", value: "132" },
  { label: "Cities", value: "27" },
  { label: "Delivery Rating", value: "Good" },
  { label: "Customer Rating", value: "Moderate" },
];

/* -------------------------------- Component ------------------------------ */

function BuilderPage() {
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
            <span>Builders</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-foreground">Omaxe</span>
          </nav>
        </Container>
      </div>

      {/* Hero */}
      <div className="border-b border-border bg-surface">
        <Container>
          <div className="py-12 sm:py-16">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              Builder Intelligence Report
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Omaxe
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              One of India's established real estate developers with
              residential, commercial, and township projects across multiple
              states.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TAGS.map((t) => (
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

      {/* Main + Sidebar */}
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
          <div className="min-w-0 space-y-16">
            {/* Trust Score */}
            <section aria-labelledby="trust-score">
              <SectionHeading id="trust-score" eyebrow="01 · Trust">
                Builder trust score
              </SectionHeading>
              <Card className="mt-6 rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Overall Trust Score
                      </p>
                      <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-foreground">
                        8.8
                        <span className="ml-1 text-xl font-normal text-muted-foreground">
                          / 10
                        </span>
                      </p>
                    </div>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Weighted across delivery, legal standing, customer
                      experience and financial stability.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {TRUST_INDICATORS.map((s) => (
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
                              s.tone === "neutral" && "bg-warning",
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

            {/* Executive Summary */}
            <section aria-labelledby="exec-summary">
              <SectionHeading id="exec-summary" eyebrow="02 · Overview">
                Executive summary
              </SectionHeading>
              <Card className="mt-6 rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-base leading-relaxed text-foreground">
                    Omaxe has a long operating history and a broad portfolio of
                    residential and commercial developments. While many projects
                    have been delivered successfully, buyers should review
                    project-specific timelines, legal approvals, and recent
                    customer feedback before making a decision.
                  </p>
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
                    Trust Score
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                    8.8
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                      / 10
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
                    At a glance
                  </p>
                  <dl className="mt-4 space-y-3">
                    {SIDEBAR.map((f) => (
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
                <Link to="/project/hero-homes">Explore Omaxe projects</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Container>

      {/* Company Overview — alt bg */}
      <Section className="border-y border-border bg-muted/40">
        <SectionHeading eyebrow="03 · Company">
          Company overview
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPANY.map((c) => (
            <Card
              key={c.label}
              className="rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
                  {c.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Performance Snapshot */}
      <Section>
        <SectionHeading eyebrow="04 · Performance">
          Performance snapshot
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERFORMANCE.map((m) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Delivery History — alt bg */}
      <Section className="border-y border-border bg-muted/40">
        <SectionHeading eyebrow="05 · Track record">
          Delivery history
        </SectionHeading>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <ol className="relative space-y-6 border-l border-border pl-6">
            {DELIVERY.map((d) => {
              const Icon = STATUS_ICON[d.status];
              return (
                <li key={d.name} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-muted-foreground"
                  >
                    <Landmark className="h-3 w-3" />
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {d.name}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {d.detail}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLES[d.status],
                      )}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                      {d.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* Project Portfolio */}
      <Section>
        <SectionHeading eyebrow="06 · Portfolio">
          Project portfolio
        </SectionHeading>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PORTFOLIO.map((p) => (
            <Card
              key={p.name}
              className="flex h-full flex-col rounded-xl border-border bg-surface shadow-none"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-foreground">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                    {p.status}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                  {p.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.city}
                </p>
                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium text-foreground">
                      {p.category}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Starts at</dt>
                    <dd className="font-medium text-foreground">{p.price}</dd>
                  </div>
                </dl>
                <div className="flex-1" />
                <Button asChild variant="outline" className="mt-6 w-full">
                  <Link to={p.href}>
                    View Project
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Customer Experience — alt bg */}
      <Section className="border-y border-border bg-muted/40">
        <SectionHeading eyebrow="07 · Experience">
          Customer experience
        </SectionHeading>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCE.map((e) => {
            const Icon = e.icon;
            return (
              <Card
                key={e.title}
                className="rounded-xl border-border bg-surface shadow-none"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {e.rating.toFixed(1)}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        /10
                      </span>
                    </p>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {e.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {e.detail}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Strengths & Risks */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="08 · Strengths">
              What works
            </SectionHeading>
            <div className="mt-6 space-y-3">
              {STRENGTHS.map((s) => (
                <Card
                  key={s}
                  className="rounded-xl border-border bg-surface shadow-none"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-success/10 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-medium text-foreground">{s}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="09 · Reality check">
              Risks & considerations
            </SectionHeading>
            <div className="mt-6 space-y-3">
              {RISKS.map((r) => (
                <Card
                  key={r}
                  className="rounded-xl border-border bg-surface shadow-none"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-warning/10 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-relaxed text-foreground">
                      {r}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Final Recommendation — alt bg */}
      <Section className="border-y border-border bg-muted/40">
        <SectionHeading eyebrow="10 · Verdict">
          Final recommendation
        </SectionHeading>
        <Card className="mt-6 rounded-xl border-l-2 border-accent bg-surface shadow-none">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              NestHunt Assessment
            </div>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground">
              Suitable for buyers seeking established developers with
              diversified portfolios, provided project-level due diligence is
              completed before purchase.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-accent" /> Balanced view
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Not a
                recommendation to transact
              </span>
            </div>
          </CardContent>
        </Card>
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
                Continue your builder due diligence
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-background/70">
                Explore Omaxe's live projects or compare against other national
                developers side-by-side.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-accent text-foreground hover:bg-accent/90"
              >
                <Link to="/project/hero-homes">Explore Omaxe Projects</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/journey">Compare Builders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
