import { createFileRoute } from "@tanstack/react-router";
import { 
  Building2, 
  ShieldCheck, 
  TriangleAlert, 
  FileCheck,
  CheckCircle2,
  Info
} from "lucide-react";
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
import { Link } from "@tanstack/react-router";
import { useProject } from "@/hooks/useNestHunt";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
  notFoundComponent: ProjectNotFound,
  head: ({ loaderData, params }) => {
    // This will be properly implemented once the public service is ready
    const name = "Project"; 
    const title = `${name} | Project Intelligence | NestHunt`;
    return {
      meta: [
        { title },
        { name: "robots", content: "noindex, nofollow" } // Safe default for foundations
      ],
    };
  },
});

function ProjectShell({ children }: { children: React.ReactNode }) {
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
              <Link to="/">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name ?? "Project"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  );
}

function ProjectSkeleton() {
  return (
    <ProjectShell>
      <Crumbs />
      <Section aria-busy="true" aria-label="Loading project report">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </Section>
    </ProjectShell>
  );
}

function ProjectNotFound() {
  return (
    <ProjectShell>
      <Crumbs />
      <Section>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Project not found
        </h1>
        <div className="mt-6 max-w-xl">
          <PlaceholderCard 
            title="Project not found" 
            description="This project report does not exist or is not published yet." 
          />
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md px-3 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
      </Section>
    </ProjectShell>
  );
}

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const { data: project, isPending, isError } = useProject(slug);

  if (isPending) return <ProjectSkeleton />;
  if (isError || !project) return <ProjectNotFound />;

  // Foundations only - simple placeholder using existing Project data
  return (
    <ProjectShell>
      <Crumbs name={project.name} />
      <Section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
              {project.summary}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {project.status.replace("-", " ")}
          </Badge>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" />
                Executive Summary
              </h2>
              <Card>
                <CardContent className="p-6">
                   <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                     {project.summary || "Summary pending verification."}
                   </p>
                </CardContent>
              </Card>
            </section>

            {/* Legacy data rendering to verify foundation */}
            {(project.risks.length > 0 || project.strengths.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {project.strengths.length > 0 && (
                  <section>
                    <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {project.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success/60 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {project.risks.length > 0 && (
                  <section>
                    <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <TriangleAlert className="h-4 w-4 text-destructive" />
                      Risks
                    </h3>
                    <ul className="space-y-2">
                      {project.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg mb-4">Quick Facts</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">Property Type</dt>
                    <dd className="mt-1 font-medium">{project.metrics.unitTypes || "Residential"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">Price Range</dt>
                    <dd className="mt-1 font-medium">{project.metrics.priceRange || "Pricing on request"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">Possession</dt>
                    <dd className="mt-1 font-medium">{project.metrics.possessionYear || "TBD"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </aside>
        </div>
      </Section>
    </ProjectShell>
  );
}
