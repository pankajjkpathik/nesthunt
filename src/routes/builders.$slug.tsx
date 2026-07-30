import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBuilder, useBuilderProjects } from "@/hooks/useBuilder";
import { BuilderHero } from "@/components/builder/BuilderHero";
import { BuilderExecutiveSummary } from "@/components/builder/BuilderExecutiveSummary";

const SECTIONS: Array<{ id: string; title: string; description: string }> = [
  { id: "hero", title: "Hero", description: "Builder identity, trust score and key badges." },
  { id: "executive-summary", title: "Executive Summary", description: "Analyst view of the developer in short form." },
  { id: "quick-facts", title: "Quick Facts", description: "Headquarters, years active, RERA and scale at a glance." },
  { id: "portfolio", title: "Portfolio", description: "Published projects delivered and under development." },
  { id: "delivery", title: "Delivery", description: "On-time record and completion timeline." },
  { id: "market", title: "Market", description: "Price positioning and market segments served." },
  { id: "customer-experience", title: "Customer Experience", description: "Buyer sentiment, service and post-handover record." },
  { id: "regulatory", title: "Regulatory", description: "RERA registrations, certifications and compliance." },
  { id: "risks", title: "Risks", description: "Watch-outs a buyer should verify before committing." },
  { id: "faq", title: "FAQ", description: "Common questions about this developer." },
  { id: "related-builders", title: "Related Builders", description: "Comparable developers in the same markets." },
];

export const Route = createFileRoute("/builders/$slug")({
  component: BuilderDetailPage,
  errorComponent: BuilderError,
  notFoundComponent: BuilderNotFound,
  head: ({ params }) => {
    const url = `https://nesthunt.in/builders/${params.slug}`;
    return {
      meta: [
        { title: "Builder Intelligence | NestHunt" },
        {
          name: "description",
          content:
            "Verified builder intelligence — delivery record, regulatory standing and portfolio analysis on NestHunt.",
        },
        { property: "og:title", content: "Builder Intelligence | NestHunt" },
        {
          property: "og:description",
          content:
            "Verified builder intelligence — delivery record, regulatory standing and portfolio analysis on NestHunt.",
        },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function BuilderShell({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function Crumbs({ name }: { name?: string }) {
  return (
    <Container className="pt-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Builders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name ?? "Builder"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
}

function BuilderSkeleton() {
  return (
    <BuilderShell>
      <Crumbs />
      <Section aria-busy="true" aria-label="Loading builder report">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </Section>
    </BuilderShell>
  );
}

function EmptyBuilderState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <BuilderShell>
      <Crumbs />
      <Section>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="mt-6 max-w-xl">
          <PlaceholderCard title={title} description={description} />
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md px-3 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
      </Section>
    </BuilderShell>
  );
}

function BuilderNotFound() {
  return (
    <EmptyBuilderState
      title="Builder not found"
      description="This builder report does not exist or is not published yet."
    />
  );
}

function BuilderError() {
  return (
    <EmptyBuilderState
      title="Report unavailable"
      description="We could not load this builder report. Please try again in a moment."
    />
  );
}

function BuilderDetailPage() {
  const { slug } = Route.useParams();
  const { data, isPending, isError } = useBuilder(slug);
  const builderId = data?.builder.id;
  const projects = useBuilderProjects(builderId);

  if (isPending) return <BuilderSkeleton />;
  if (isError) return <BuilderError />;
  if (!data) return <BuilderNotFound />;

  const { builder } = data;

  return (
    <BuilderShell>
      <Crumbs name={builder.name} />
      <Section>
        <BuilderHero builder={builder} />

        <div className="mt-12">
          <BuilderExecutiveSummary summary={builder.summary} />
        </div>

        <div className="mt-10 space-y-6">
          {SECTIONS.filter((s) => s.id !== "hero" && s.id !== "executive-summary").map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
            >
              <h2 id={`${section.id}-heading`} className="sr-only">
                {section.title}
              </h2>
              <PlaceholderCard
                title={section.title}
                description={
                  section.id === "portfolio" && projects.data
                    ? `${projects.data.length} published project(s) linked to this builder.`
                    : section.description
                }
              />
            </section>
          ))}
        </div>
      </Section>
    </BuilderShell>
  );
}
