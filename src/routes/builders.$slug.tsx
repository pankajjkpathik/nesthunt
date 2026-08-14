import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Building2, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { InsightListCard } from "@/components/common/InsightListCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const { builder, risks, evidence, promises, leadership, rera, certifications, awards, faqs } = data;

  const strengths = builder.strengths as string[] || [];
  const watchOuts = builder.watch_outs as string[] || [];

  return (
    <BuilderShell>
      <Crumbs name={builder.name} />
      <Section>
        <BuilderHero builder={builder} />

        <div className="mt-12">
          <BuilderExecutiveSummary summary={builder.summary} />
        </div>

        {/* Intelligence Cards */}
        {(strengths.length > 0 || watchOuts.length > 0) && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {strengths.length > 0 && (
              <InsightListCard
                title="Key Strengths"
                items={strengths}
                tone="positive"
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
            )}
            {watchOuts.length > 0 && (
              <InsightListCard
                title="Watch Outs"
                items={watchOuts}
                tone="negative"
                icon={<TriangleAlert className="h-4 w-4" />}
              />
            )}
          </div>
        )}

        <div className="mt-10 space-y-12">
          {/* Portfolio Section */}
          <section id="portfolio" aria-labelledby="portfolio-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="portfolio-heading" className="font-display text-2xl font-bold tracking-tight text-foreground">
                Project Portfolio
              </h2>
              {projects.data && (
                <Badge variant="secondary" className="font-mono">
                  {projects.data.length} Projects
                </Badge>
              )}
            </div>
            
            {projects.data && projects.data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.data.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}` as any}
                    className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/40 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                      {/* TODO: Add project hero image when media relationship is wired to projects */}
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                        <Building2 className="h-12 w-12" />
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-none">
                          {project.constructionStatus || project.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      {project.tagline && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {project.tagline}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <PlaceholderCard
                title="Portfolio Pending"
                description="Project associations are currently being verified for this builder."
                icon={<Building2 className="h-5 w-5" />}
              />
            )}
          </section>

          {/* Risks & Watch-outs (Table driven) */}
          {(risks.length > 0 || evidence.length > 0) && (
            <section id="intelligence" aria-labelledby="intelligence-heading" className="grid gap-8 lg:grid-cols-2">
              {risks.length > 0 && (
                <div>
                  <h2 id="risks-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
                    Risk Assessment
                  </h2>
                  <div className="space-y-4">
                    {risks.map((risk) => (
                      <Card key={risk.id} className="border-border bg-surface overflow-hidden">
                        <div className={`h-1 w-full ${
                          risk.severity === 'critical' ? 'bg-destructive' :
                          risk.severity === 'high' ? 'bg-orange-500' :
                          risk.severity === 'medium' ? 'bg-warning' : 'bg-muted'
                        }`} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider">
                                {risk.category}
                              </Badge>
                              <h4 className="font-display font-semibold text-foreground">{risk.title}</h4>
                            </div>
                            <Badge className={
                              risk.status === 'mitigated' ? 'bg-success/10 text-success border-success/20' : 
                              'bg-muted text-muted-foreground border-none'
                            }>
                              {risk.status}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {risk.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {evidence.length > 0 && (
                <div>
                  <h2 id="evidence-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
                    Verified Evidence
                  </h2>
                  <div className="space-y-4">
                    {evidence.map((ev) => (
                      <Card key={ev.id} className="border-border bg-surface">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                  {ev.evidence_type}
                                </Badge>
                                {ev.verification_status === 'verified' && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                )}
                              </div>
                              <h4 className="font-display font-semibold text-foreground">{ev.title}</h4>
                              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                {ev.description}
                              </p>
                              {ev.source_url && (
                                <a 
                                  href={ev.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center text-xs font-medium text-accent hover:underline"
                                >
                                  View Source Document
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Placeholder for remaining sections - only show if no major data exists */}
          {risks.length === 0 && evidence.length === 0 && (
            <div className="space-y-6">
              {SECTIONS.filter((s) => !["hero", "executive-summary", "portfolio", "risks"].includes(s.id)).map((section) => (
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
                    description={section.description}
                  />
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 p-6 rounded-xl border border-border bg-muted/30">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground mb-1">NestHunt Assessment Disclaimer</p>
              NestHunt assessment is based on currently available verified information. While we strive for accuracy, development plans and corporate structures can change. This report is for informational purposes only and does not constitute financial or investment advice. Complete project-level due diligence before making a purchase decision.
            </div>
          </div>
        </div>
      </Section>
    </BuilderShell>
  );
}
