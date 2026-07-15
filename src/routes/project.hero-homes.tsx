import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, CalendarClock, Layers3, FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { heroHomes, omaxe, newChandigarh } from "@/mocks";

export const Route = createFileRoute("/project/hero-homes")({
  head: () => ({
    meta: [
      { title: `${heroHomes.name} — Project Overview | NestHunt` },
      {
        name: "description",
        content: `Verified project overview for ${heroHomes.name}: unit mix, pricing, possession, and builder track record.`,
      },
      { property: "og:title", content: `${heroHomes.name} — NestHunt` },
      { property: "og:description", content: heroHomes.summary },
    ],
  }),
  component: ProjectPage,
});

const STATUS_LABEL: Record<typeof heroHomes.status, string> = {
  planning: "Planning",
  "under-construction": "Under construction",
  ready: "Ready to move",
};

function ProjectPage() {
  const project = heroHomes;

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
            <span>
              By{" "}
              <Link
                to="/builder/omaxe"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {omaxe.name}
              </Link>
            </span>
            <span aria-hidden>·</span>
            <span>
              In{" "}
              <Link
                to="/places/new-chandigarh"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {newChandigarh.name}
              </Link>
            </span>
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

          <section aria-labelledby="project-modules">
            <h2
              id="project-modules"
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              Coming to this page
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <PlaceholderCard
                icon={<Home className="h-4 w-4" />}
                title="Unit configurations"
                description="Floor plans, carpet area, and orientation-level details."
              />
              <PlaceholderCard
                icon={<CalendarClock className="h-4 w-4" />}
                title="Construction timeline"
                description="Milestone-by-milestone progress verified against RERA filings."
              />
              <PlaceholderCard
                icon={<Layers3 className="h-4 w-4" />}
                title="Amenities & layout"
                description="Structured breakdown of shared spaces and open ground area."
              />
              <PlaceholderCard
                icon={<FileText className="h-4 w-4" />}
                title="Documents"
                description="Approvals, RERA registration, and legal disclosures."
              />
            </div>
          </section>
        </div>
      </Container>
    </AppLayout>
  );
}
