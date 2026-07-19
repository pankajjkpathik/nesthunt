import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Scale,
  HardHat,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { InsightListCard } from "@/components/common/InsightListCard";
import { Card, CardContent } from "@/components/ui/card";
import { useProject, useBuilder, usePlace } from "@/hooks/useNestHunt";
import type { Project } from "@/types";

export const Route = createFileRoute("/project/hero-homes")({
  head: () => ({
    meta: [
      { title: "Hero Homes — Project Overview | NestHunt" },
      {
        name: "description",
        content:
          "Verified project overview for Hero Homes: unit mix, pricing, possession, and builder track record.",
      },
      { property: "og:title", content: "Hero Homes — NestHunt" },
      {
        property: "og:description",
        content:
          "A mid-to-premium residential development in New Chandigarh with low-density planning and structured amenities.",
      },
    ],
  }),
  component: ProjectPage,
});

const STATUS_LABEL: Record<Project["status"], string> = {
  planning: "Planning",
  "under-construction": "Under construction",
  ready: "Ready to move",
};

function ProjectPage() {
  const { data: project, isLoading } = useProject("hero-homes");
  const { data: builder } = useBuilder("omaxe");
  const { data: place } = usePlace("new-chandigarh");

  if (isLoading || !project) {
    return (
      <AppLayout>
        <Container>
          <div className="py-24 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading project…" : "Project not found."}
          </div>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.summary}
      />
      <Container>
        <div className="space-y-10 py-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
              {STATUS_LABEL[project.status]}
            </span>
            {builder && (
              <span>
                By{" "}
                <Link
                  to="/builder/omaxe"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {builder.name}
                </Link>
              </span>
            )}
            {place && (
              <>
                <span aria-hidden>·</span>
                <span>
                  In{" "}
                  <Link
                    to="/places/new-chandigarh"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {place.name}
                  </Link>
                </span>
              </>
            )}
          </div>

          <section aria-labelledby="project-metrics">
            <h2
              id="project-metrics"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              At a glance
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Unit types" value={project.metrics.unitTypes} />
              <MetricCard label="Price range" value={project.metrics.priceRange} />
              <MetricCard
                label="Possession"
                value={project.metrics.possessionYear}
              />
              <MetricCard label="Total units" value={project.metrics.totalUnits} />
            </div>
          </section>

          <section aria-labelledby="should-you-buy">
            <h2
              id="should-you-buy"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Should you buy?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Suitable for
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {project.suitableFor.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border bg-surface shadow-none">
                <CardContent className="p-6">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Less suitable for
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {project.lessSuitableFor.map((s) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <InsightListCard
              title="Project strengths"
              items={project.strengths}
              icon={<Sparkles className="h-4 w-4" />}
              tone="positive"
            />
            <InsightListCard
              title="Project risks"
              items={project.risks}
              icon={<AlertTriangle className="h-4 w-4" />}
              tone="negative"
            />
            <InsightListCard
              title="Legal snapshot"
              items={project.legal}
              icon={<Scale className="h-4 w-4" />}
            />
            <InsightListCard
              title="Construction progress"
              items={project.progress}
              icon={<HardHat className="h-4 w-4" />}
            />
          </section>
        </div>
      </Container>
    </AppLayout>
  );
}
