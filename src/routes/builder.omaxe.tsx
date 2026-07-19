import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { DecisionScoreCard } from "@/components/common/DecisionScoreCard";
import { InsightListCard } from "@/components/common/InsightListCard";
import { omaxe } from "@/mocks";

export const Route = createFileRoute("/builder/omaxe")({
  head: () => ({
    meta: [
      { title: `${omaxe.name} — Builder Profile | NestHunt` },
      {
        name: "description",
        content: `Verified profile of ${omaxe.name}: delivery history, ongoing projects, and regulatory status.`,
      },
      { property: "og:title", content: `${omaxe.name} — NestHunt` },
      { property: "og:description", content: omaxe.summary },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const builder = omaxe;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Builder"
        title={builder.name}
        description={builder.summary}
      />
      <Container>
        <div className="space-y-10 py-10">
          <section aria-labelledby="builder-metrics">
            <h2
              id="builder-metrics"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Track record
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Completed projects"
                value={builder.metrics.completedProjects}
              />
              <MetricCard
                label="Ongoing projects"
                value={builder.metrics.ongoingProjects}
              />
              <MetricCard
                label="On-time delivery"
                value={builder.metrics.onTimeDeliveryRate}
              />
              <MetricCard
                label="RERA status"
                value={builder.metrics.reraRegistered ? "Registered" : "Not verified"}
              />
            </div>
          </section>

          <section aria-labelledby="trust-score">
            <h2
              id="trust-score"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Builder trust score
            </h2>
            <DecisionScoreCard
              title="Trust score"
              score={builder.decision.score}
              scale={100}
              confidence={builder.decision.confidence}
              verdict={builder.decision.verdict}
            />
          </section>

          <section
            aria-labelledby="signals"
            className="grid gap-3 sm:grid-cols-2"
          >
            <h2 id="signals" className="sr-only">
              Strengths and watch-outs
            </h2>
            <InsightListCard
              title="Strengths"
              items={builder.strengths}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="positive"
            />
            <InsightListCard
              title="Watch-outs"
              items={builder.watchOuts}
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="negative"
            />
          </section>

          <section aria-labelledby="timeline">
            <h2
              id="timeline"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Company timeline
            </h2>
            <div className="rounded-xl border border-border bg-surface p-6">
              <ol className="relative space-y-6 border-l border-border pl-6">
                {builder.timeline.map((t) => (
                  <li key={t.year} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent"
                    />
                    <p className="font-display text-sm font-semibold tracking-tight text-foreground">
                      {t.year}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t.label}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section aria-labelledby="builder-modules">
            <h2
              id="builder-modules"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Coming to this page
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <PlaceholderCard
                icon={<Building2 className="h-4 w-4" />}
                title="Project portfolio"
                description="All completed and ongoing projects with delivery timelines."
              />
              <PlaceholderCard
                icon={<ClipboardCheck className="h-4 w-4" />}
                title="Delivery track record"
                description="Verified handover dates against original commitments."
              />
              <PlaceholderCard
                icon={<TrendingUp className="h-4 w-4" />}
                title="Financial health"
                description="Public disclosures, litigation, and regulatory standing."
              />
              <PlaceholderCard
                icon={<MessageSquare className="h-4 w-4" />}
                title="Resident feedback"
                description="Structured, verified sentiment from prior projects."
              />
            </div>
          </section>
        </div>
      </Container>
    </AppLayout>
  );
}
