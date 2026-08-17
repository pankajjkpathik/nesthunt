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
    const project = (loaderData as PublicProject | undefined)?.project;
    const isPublished = (project?.publish_status ?? "draft") === "published";
    const name = project?.name || "Project";
    const slug = params.slug;
    const url = `https://www.nesthunt.in/projects/${slug}`;
    
    const title = `${name} | Project Intelligence | NestHunt`;
    
    // Construct meta description
    let description = "";
    if (project?.summary || project?.short_description) {
      description = (project.summary || project.short_description || "").substring(0, 160);
    } else {
      const builderName = project?.builder?.name;
      const placeName = project?.place?.name;
      const type = project?.property_type || "property";
      description = `Explore verified information, project details, ${builderName ? `by ${builderName}, ` : ""}${placeName ? `in ${placeName}, ` : ""}configurations and key considerations for ${name} on NestHunt.`;
    }

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
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

    // Image priority: Project Hero Image -> NestHunt default social image
    const heroImage = project?.hero?.heroImageUrl || project?.hero?.coverImageUrl;
    if (heroImage) {
      meta.push({ property: "og:image", content: heroImage });
      meta.push({ name: "twitter:image", content: heroImage });
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
      queryKey: ["projects", "slug", params.slug],
      queryFn: () => ProjectPublicService.getProjectBySlug(params.slug!),
    });
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
      <ProjectHero project={project} />

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
              <ProjectDocuments project={project} />
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
