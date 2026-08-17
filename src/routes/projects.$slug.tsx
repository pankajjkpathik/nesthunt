import { createFileRoute } from "@tanstack/react-router";
import { 
  ChevronRight,
  Home
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ProjectPublicService } from "@/lib/services/projects-public";
import { useQuery } from "@tanstack/react-query";

// Import new modular components
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectExecutiveSummary } from "@/components/project/ProjectExecutiveSummary";
import { ProjectQuickFacts } from "@/components/project/ProjectQuickFacts";
import { ProjectPromises } from "@/components/project/ProjectPromises";
import { ProjectRisks } from "@/components/project/ProjectRisks";
import { ProjectEntityRelationships } from "@/components/project/ProjectEntityRelationships";
import { ProjectAmenities } from "@/components/project/ProjectAmenities";
import { ProjectDocuments } from "@/components/project/ProjectDocuments";
import { ProjectDueDiligence } from "@/components/project/ProjectDueDiligence";
import { ProjectIntelligenceSummary } from "@/components/project/ProjectIntelligenceSummary";
import { ProjectNearbyInfrastructure } from "@/components/project/ProjectNearbyInfrastructure";
import { ProjectConfigurations } from "@/components/project/ProjectConfigurations";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
  notFoundComponent: ProjectNotFound,
  head: ({ loaderData, params }) => {
    // Note: head metadata can't use hooks/query, but TanStack Router allows passing data
    // For now we'll set a generic title which is better than "NestHunt"
    return {
      meta: [
        { title: "Project Intelligence Report | NestHunt" },
        { name: "description", content: "Detailed project intelligence, verified commitments, risks, and infrastructure analysis." }
      ],
    };
  },
});

function ProjectShell({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function ProjectSkeleton() {
  return (
    <ProjectShell>
      <div className="h-[400px] w-full bg-muted animate-pulse" />
      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-12">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </ProjectShell>
  );
}

function ProjectNotFound() {
  return (
    <ProjectShell>
      <Container className="py-24">
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
          className="mt-6 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </Container>
    </ProjectShell>
  );
}

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const { data: projectData, isPending, isError } = useQuery({
    queryKey: ["projects", "slug", slug],
    queryFn: () => ProjectPublicService.getProjectBySlug(slug!),
    enabled: !!slug,
  });

  if (isPending) return <ProjectSkeleton />;
  if (isError || !projectData) return <ProjectNotFound />;

  const { project, risks, promises, media, decisionEntity } = projectData;

  return (
    <ProjectShell>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span>Projects</span>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-foreground">{project.name}</span>
          </nav>
        </Container>
      </div>

      {/* Hero Section */}
      <ProjectHero project={project} media={media} />

      <Container>
        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
          <div className="min-w-0 space-y-20">
            {/* 01 · Intelligence Summary */}
            <ProjectIntelligenceSummary decisionEntity={decisionEntity} />

            {/* 02 · Executive Summary */}
            <ProjectExecutiveSummary summary={project.summary} />

            {/* 03 · Configurations */}
            <ProjectConfigurations unitTypes={project.unit_types} />

            {/* 04 · Amenities */}
            <ProjectAmenities amenities={project.amenities} />

            {/* 05 · Infrastructure */}
            <ProjectNearbyInfrastructure nearby={project.nearby} />

            {/* 06 · Builder & Locality */}
            <section id="relationships" aria-labelledby="rel-heading">
              <h2 id="rel-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
                Developer & Location
              </h2>
              <ProjectEntityRelationships project={project} />
            </section>

            {/* 07 · Verified Commitments */}
            <ProjectPromises promises={promises} />

            {/* 08 · Risks & Considerations */}
            <ProjectRisks risks={risks} />

            {/* 09 · Regulatory & Documents */}
            <div className="grid gap-12 md:grid-cols-2">
              <ProjectDocuments />
              <ProjectDueDiligence />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <ProjectQuickFacts project={project} />
            </div>
          </aside>
        </div>
      </Container>
    </ProjectShell>
  );
}
