import { createFileRoute } from "@tanstack/react-router";
import { Building2, ClipboardCheck, TrendingUp, MessageSquare } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
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
