/**
 * BUILDER INTELLIGENCE V1 FROZEN
 * 
 * Builder Intelligence V1 is feature-complete. Future changes should be limited 
 * to bug fixes, security fixes, data-integrity fixes and explicitly approved V2 work.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Building2, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  TriangleAlert, 
  Users, 
  Award, 
  FileCheck, 
  HelpCircle,
  ExternalLink,
  ArrowRight
} from "lucide-react";
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
import { BuilderPublicService, type PublicBuilder } from "@/lib/services/builders-public";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/builders/$slug")({
  component: BuilderDetailPage,
  errorComponent: BuilderError,
  notFoundComponent: BuilderNotFound,
  head: ({ loaderData, params }) => {
    const builder = (loaderData as PublicBuilder | undefined)?.builder;
    const isPublished = (builder?.status ?? "draft") === "published";
    const name = builder?.name || "Builder";
    const slug = params.slug;
    const url = `https://www.nesthunt.in/builders/${slug}`;
    
    const title = `${name} | Builder Intelligence | NestHunt`;
    const description = builder?.summary || builder?.description 
      ? (builder.summary || builder.description).substring(0, 160)
      : `Explore verified information, projects, performance and key considerations for ${name} on NestHunt.`;

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "NestHunt" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];

    if (!isPublished) {
      meta.push({ name: "robots", content: "noindex, nofollow" });
    } else {
      meta.push({ name: "robots", content: "index, follow" });
    }

    const logoUrl = (builder?.hero as any)?.logoUrl;
    if (logoUrl) {
      meta.push({ property: "og:image", content: logoUrl });
      meta.push({ name: "twitter:image", content: logoUrl });
    } else {
      const defaultImage = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9471d1c9-304b-4e47-9847-65fc97f88baf/id-preview-095ab6e1--05125b68-1c29-49a1-ae8f-0a25a14f8684.lovable.app-1784118590439.png";
      meta.push({ property: "og:image", content: defaultImage });
      meta.push({ name: "twitter:image", content: defaultImage });
    }

    return {
      meta,
      links: [{ rel: "canonical", href: url }],
    };
  },
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: ["public", "builder", params.slug],
      queryFn: () => BuilderPublicService.getBuilderBySlug(params.slug),
    });
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
              <Link to="/builders">Builders</Link>
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
  const loaderData = Route.useLoaderData() as PublicBuilder | null;
  const { data: queryData, isPending, isError } = useBuilder(slug);
  
  const data = queryData || loaderData;
  const builderId = data?.builder.id;
  const projects = useBuilderProjects(builderId);

  if (isPending && !data) return <BuilderSkeleton />;
  if (isError && !data) return <BuilderError />;
  if (!data) return <BuilderNotFound />;

  const { builder, risks, evidence, promises, leadership, rera, certifications, awards, faqs } = data;

  const strengths = builder.strengths as string[] || [];
  const watchOuts = builder.watch_outs as string[] || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": builder.name,
        "url": `https://www.nesthunt.in/builders/${slug}`,
        "logo": (builder.hero as any)?.logoUrl,
        "description": builder.summary || builder.description,
        "foundingDate": builder.year_established,
        "address": builder.headquarters ? {
          "@type": "PostalAddress",
          "addressLocality": builder.headquarters
        } : undefined,
        "sameAs": builder.website ? [builder.website] : []
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.nesthunt.in/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Builders",
            "item": "https://www.nesthunt.in/builders"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": builder.name,
            "item": `https://www.nesthunt.in/builders/${slug}`
          }
        ]
      },
      faqs && faqs.length > 0 ? {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      } : null
    ].filter(Boolean)
  };

  return (
    <BuilderShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        <div className="mt-10 space-y-16">
          {/* Portfolio Section */}
          <section id="portfolio" aria-labelledby="portfolio-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="portfolio-heading" className="font-display text-2xl font-bold tracking-tight text-foreground">
                Project Portfolio
              </h2>
              {projects.data && (
                <Badge variant="secondary" className="font-mono">
                  {projects.data.length} {projects.data.length === 1 ? 'Project' : 'Projects'}
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

          {/* Commitment Tracker (Promise Ledger) */}
          <section id="promises" aria-labelledby="promises-heading">
            <h2 id="promises-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
              Commitment Tracker
            </h2>
            {promises.length > 0 ? (
              <div className="grid gap-4">
                {promises.map((p) => (
                  <Card key={p.id} className="border-border bg-surface">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-semibold text-foreground">{p.promise}</h4>
                          {p.remarks && <p className="text-sm text-muted-foreground">{p.remarks}</p>}
                        </div>
                        <Badge className={
                          p.status === 'completed' || p.status === 'delivered' ? 'bg-success/10 text-success border-success/20' : 
                          p.status === 'progress' || p.status === 'ongoing' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-muted text-muted-foreground border-none'
                        }>
                          {p.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <PlaceholderCard
                title="No verified delivery history available."
                description="The delivery record for this developer is currently under audit."
                icon={<ShieldCheck className="h-5 w-5" />}
              />
            )}
          </section>

          {/* Risks & Considerations */}
          <section id="risks" aria-labelledby="risks-heading">
            <h2 id="risks-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
              Risks & Considerations
            </h2>
            {risks.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
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
            ) : (
              <PlaceholderCard
                title="Assessment Pending"
                description="No critical risks have been identified in the current reporting cycle."
                icon={<ShieldCheck className="h-5 w-5" />}
              />
            )}
          </section>

          {/* Regulatory Compliance (RERA) */}
          <section id="regulatory" aria-labelledby="regulatory-heading">
            <h2 id="regulatory-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
              Regulatory Compliance
            </h2>
            {rera.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Reg. Number</th>
                      <th className="px-4 py-3 font-semibold">Authority</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {rera.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono text-xs">{r.registration_number}</td>
                        <td className="px-4 py-3">{r.authority}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {r.status || 'Active'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {r.registration_url && (
                            <a href={r.registration_url} target="_blank" rel="noopener" className="text-accent hover:underline flex items-center gap-1">
                              Verify <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <PlaceholderCard
                title="RERA verification in progress"
                description="Regulatory records are being synchronized with official portals."
                icon={<FileCheck className="h-5 w-5" />}
              />
            )}
          </section>

          {/* Leadership Team */}
          {leadership.length > 0 && (
            <section id="leadership" aria-labelledby="leadership-heading">
              <h2 id="leadership-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
                Leadership Team
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {leadership.map((member) => (
                  <Card key={member.id} className="border-border bg-surface">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.designation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Awards & FAQ if they exist */}
          <div className="grid gap-12 lg:grid-cols-2">
            {awards.length > 0 && (
              <section id="awards" aria-labelledby="awards-heading">
                <h2 id="awards-heading" className="font-display text-xl font-bold tracking-tight text-foreground mb-4">
                  Awards & Recognition
                </h2>
                <div className="space-y-3">
                  {awards.map((award) => (
                    <div key={award.id} className="flex gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <Award className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-semibold">{award.name}</h5>
                        <p className="text-xs text-muted-foreground">{award.issuer} {award.year && `• ${award.year}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {faqs.length > 0 && (
              <section id="faq" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-display text-xl font-bold tracking-tight text-foreground mb-4">
                  Common Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={faq.id || i} value={`item-${i}`}>
                      <AccordionTrigger className="text-sm font-medium text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* NestHunt Assessment Disclaimer */}
          <section className="rounded-2xl border border-border bg-muted/30 p-8 text-center max-w-3xl mx-auto">
            <ShieldCheck className="h-10 w-10 text-accent mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
              NestHunt Assessment Disclaimer
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This intelligence report is based on verified public records, site inspections, and data provided by the developer as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. While we strive for absolute accuracy, real estate involves inherent risks. We recommend independent legal verification of all documents before financial commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-full">
                Download Full Report
              </Button>
              <Button size="lg" variant="outline" className="rounded-full group">
                Consult an Analyst <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </section>
        </div>
      </Section>
    </BuilderShell>
  );
}
