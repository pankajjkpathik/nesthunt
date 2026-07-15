import { createFileRoute } from "@tanstack/react-router";
import { Compass, ListChecks, GitCompare, BookmarkCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My Journey — NestHunt" },
      {
        name: "description",
        content:
          "Track your property decision journey — shortlist, compare, and revisit your reasoning at every step.",
      },
      { property: "og:title", content: "My Journey — NestHunt" },
      {
        property: "og:description",
        content:
          "Your personal workspace for evaluating places, builders, and projects.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Workspace"
        title="My Journey"
        description="A private space to shortlist, compare, and refine your property decisions over time."
      />
      <Container>
        <div className="grid gap-3 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <PlaceholderCard
            icon={<Compass className="h-4 w-4" />}
            title="Discovery"
            description="Places and builders you're actively exploring."
          />
          <PlaceholderCard
            icon={<BookmarkCheck className="h-4 w-4" />}
            title="Shortlist"
            description="Projects saved for a closer look."
          />
          <PlaceholderCard
            icon={<GitCompare className="h-4 w-4" />}
            title="Comparisons"
            description="Structured side-by-side evaluations you've built."
          />
          <PlaceholderCard
            icon={<ListChecks className="h-4 w-4" />}
            title="Decision notes"
            description="Your reasoning, saved and revisitable at any time."
          />
        </div>
      </Container>
    </AppLayout>
  );
}
