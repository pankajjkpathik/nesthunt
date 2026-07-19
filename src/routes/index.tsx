import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  BookOpen,
  FileCheck2,
  Landmark,
  Receipt,
  Satellite,
  MessagesSquare,
  History,
  TrendingUp,
  Activity,
  Train,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const VERIFICATION_SOURCES = [
  {
    icon: <FileCheck2 className="h-4 w-4" />,
    title: "RERA Records",
    description: "Builder registrations and approvals.",
  },
  {
    icon: <Landmark className="h-4 w-4" />,
    title: "Government Master Plans",
    description: "Future infrastructure and zoning.",
  },
  {
    icon: <Receipt className="h-4 w-4" />,
    title: "Registry Transactions",
    description: "Historical price movement.",
  },
  {
    icon: <Satellite className="h-4 w-4" />,
    title: "Satellite Imagery",
    description: "Construction verification.",
  },
  {
    icon: <MessagesSquare className="h-4 w-4" />,
    title: "Resident Feedback",
    description: "Verified owner sentiment.",
  },
  {
    icon: <History className="h-4 w-4" />,
    title: "Builder Track Record",
    description: "Historical delivery performance.",
  },
];

function HomePage() {
  return (
    <AppLayout>
      {/* Hero */}
      <Container>
        <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16 lg:py-32">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Property Decision Intelligence
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Make your next property decision with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              NestHunt brings verified information, structured comparisons, and
              transparent explanations to every step of your property journey — so
              you can decide without the noise.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/journey">Explore the journey</Link>
              </Button>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </Container>

      {/* Principles */}
      <Section className="border-t border-border bg-surface">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built on three principles
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every module in NestHunt is designed around clarity, not persuasion.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Verified information"
            description="Every data point ties back to a source. No unverified listings, no marketing claims."
          />
          <PlaceholderCard
            icon={<Scale className="h-4 w-4" />}
            title="Structured comparisons"
            description="Compare places, builders, and projects on the dimensions that actually matter."
          />
          <PlaceholderCard
            icon={<BookOpen className="h-4 w-4" />}
            title="Transparent explanations"
            description="Every insight explains its reasoning, so you understand what you're deciding on."
          />
        </div>
      </Section>

      {/* Verification sources */}
      <Section className="border-t border-border">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How we verify every insight
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every recommendation is supported by publicly available evidence.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERIFICATION_SOURCES.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-surface p-6"
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
    </AppLayout>
  );
}

function DashboardPreview() {
  return (
    <div
      aria-hidden
      className="relative hidden lg:block"
    >
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        {/* Chrome */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            NestHunt · Live preview
          </p>
        </div>

        {/* Headline score */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Decision Score · New Chandigarh
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
              8.9
              <span className="ml-1 text-base font-normal text-muted-foreground">
                / 10
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
            label="Builder Reliability"
            value="87%"
          />
          <KpiTile
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Price Trend"
            value="+11.4%"
            hint="12-mo"
          />
          <KpiTile
            icon={<Train className="h-3.5 w-3.5" />}
            label="Infrastructure"
            value="Metro Planned"
          />
          <KpiTile
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
            label="Risk"
            value="Low"
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
      </p>
      {hint && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
