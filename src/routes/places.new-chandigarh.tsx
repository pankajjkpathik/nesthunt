import { createFileRoute } from "@tanstack/react-router";
import { MapPin, LineChart, Layers, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { newChandigarh } from "@/mocks";

export const Route = createFileRoute("/places/new-chandigarh")({
  head: () => ({
    meta: [
      { title: `${newChandigarh.name} — Place Overview | NestHunt` },
      {
        name: "description",
        content: `Verified overview of ${newChandigarh.name}: demographics, pricing, active projects and builders.`,
      },
      { property: "og:title", content: `${newChandigarh.name} — NestHunt` },
      { property: "og:description", content: newChandigarh.summary },
    ],
  }),
  component: PlacePage,
});

function PlacePage() {
  const place = newChandigarh;

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Place"
        title={place.name}
        description={place.summary}
      />
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="metrics-heading">
              <h2
                id="metrics-heading"
                className="mb-4 font-display text-lg font-semibold text-foreground"
              >
                Key metrics
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Population" value={place.metrics.population} />
                <MetricCard
                  label="Avg. price / sqft"
                  value={place.metrics.avgPricePerSqft}
                />
                <MetricCard
                  label="Active projects"
                  value={place.metrics.activeProjects}
                />
                <MetricCard
                  label="Verified builders"
                  value={place.metrics.verifiedBuilders}
                />
              </div>
            </section>

            <section aria-labelledby="modules-heading">
              <h2
                id="modules-heading"
                className="mb-4 font-display text-lg font-semibold text-foreground"
              >
                Coming to this page
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <PlaceholderCard
                  icon={<MapPin className="h-4 w-4" />}
                  title="Neighborhood map"
                  description="Sector-level overlays for connectivity, zoning, and amenities."
                />
                <PlaceholderCard
                  icon={<LineChart className="h-4 w-4" />}
                  title="Price trends"
                  description="Historical price movement across residential and commercial segments."
                />
                <PlaceholderCard
                  icon={<Layers className="h-4 w-4" />}
                  title="Project comparison"
                  description="Side-by-side comparison of all active projects in this place."
                />
                <PlaceholderCard
                  icon={<Users className="h-4 w-4" />}
                  title="Resident insights"
                  description="Verified sentiment and long-term liveability signals."
                />
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Region
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {place.region}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Highlights
              </p>
              <ul className="mt-3 space-y-2">
                {place.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex gap-2 text-sm leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </AppLayout>
  );
}
