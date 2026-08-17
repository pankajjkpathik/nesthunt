import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Info, 
  AlertCircle, 
  LayoutGrid, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  Target,
  Building2,
  MapPin,
  Calendar,
  FileText
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { useProjectComparison } from "@/hooks/useComparison";
import { useJourney } from "@/hooks/useJourney";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DecisionScoreService, type DecisionScoreRow, type DecisionDimensionRow } from "@/lib/services/decision-intelligence";

export const Route = createFileRoute("/compare/projects")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      ids: (search.ids as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Compare Projects — NestHunt" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProjectComparisonPage,
});

function ProjectComparisonPage() {
  const { ids } = Route.useSearch();
  const projectIds = React.useMemo(() => (ids ? ids.split(",").filter(Boolean) : []), [ids]);
  const navigate = useNavigate();
  const { data: context, isLoading, isError } = useProjectComparison(projectIds);
  const { preferences } = useJourney();

  if (projectIds.length < 2) {
    return (
      <AppLayout>
        <Container className="py-20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Select at least 2 projects to compare</h2>
            <Button asChild>
              <Link to="/journey">Return to Journey</Link>
            </Button>
          </div>
        </Container>
      </AppLayout>
    );
  }

  if (projectIds.length > 3) {
    return (
      <AppLayout>
        <Container className="py-20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Compare up to 3 Projects at a time</h2>
            <Button asChild variant="outline">
              <Link to="/journey">Return to Journey</Link>
            </Button>
          </div>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <Container className="py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link to="/journey">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Journey
              </Link>
            </Button>
            <div className="h-4 w-px bg-border mx-2" />
            <h1 className="font-display font-bold text-lg">Project Comparison</h1>
          </div>
        </Container>
      </div>

      <Container className="py-12 pb-24">
        {isLoading ? (
          <ComparisonLoadingState count={projectIds.length} />
        ) : isError || !context ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Comparison unavailable</h2>
            <p className="text-muted-foreground mb-6">We couldn't load the comparison data at this time.</p>
            <Button asChild>
              <Link to="/journey">Return to Journey</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            <ComparisonMatrix context={context} preferences={preferences} />
            
            <section className="bg-muted/30 rounded-2xl p-6 border border-border max-w-3xl">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-bold text-sm">About NestHunt Comparison</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    NestHunt compares published intelligence where the underlying measures are semantically compatible. 
                    Missing or incompatible information is not converted into a score. Place and Builder intelligence 
                    are attributed to their respective sources and are not Project-native scores.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}

function ComparisonMatrix({ context, preferences }: { context: any, preferences: any[] }) {
  const { entities, dimensions } = context;

  // Sorting dimensions based on user preferences (High first)
  const sortedDimensions = React.useMemo(() => {
    return [...dimensions].sort((a, b) => {
      const prefA = preferences.find(p => p.dimensionId === a.id);
      const prefB = preferences.find(p => p.dimensionId === b.id);
      
      const priorityWeight = { high: 3, medium: 2, low: 1, none: 0 };
      const weightA = priorityWeight[prefA?.priority || 'none'] || 0;
      const weightB = priorityWeight[prefB?.priority || 'none'] || 0;
      
      if (weightA !== weightB) return weightB - weightA;
      return (a.display_order || 0) - (b.display_order || 0);
    });
  }, [dimensions, preferences]);

  return (
    <div className="space-y-8">
      {/* Entity Header */}
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="hidden md:block" />
        <div className={cn(
          "grid gap-4",
          entities.length === 2 ? "grid-cols-2" : "grid-cols-3"
        )}>
          {entities.map((entity: any) => (
            <div key={entity.id} className="space-y-4">
              <div className="aspect-[16/9] rounded-xl bg-muted overflow-hidden border border-border relative group">
                {entity.projectData.media?.[0]?.url ? (
                  <img 
                    src={entity.projectData.media[0].url} 
                    alt={entity.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LayoutGrid className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                   <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                      {entity.projectData.project.status}
                   </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-foreground leading-tight">{entity.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {entity.projectData.project.property_type || 'Residential Project'}
                </p>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
                <Link to="/projects/$slug" params={{ slug: entity.slug }}>
                  View Report <ExternalLink className="h-3 w-3 ml-1.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 px-2">
          <Target className="h-5 w-5 text-accent" />
          Decision Intelligence
        </h3>
        
        <div className="border border-border rounded-2xl overflow-hidden bg-surface">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] font-bold text-[10px] uppercase tracking-widest py-4">Dimension</TableHead>
                {entities.map((e: any) => (
                  <TableHead key={e.id} className="font-bold text-[10px] uppercase tracking-widest text-center py-4">
                    {e.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDimensions.map((dim: any) => (
                <TableRow key={dim.id} className="group transition-colors hover:bg-muted/5">
                  <TableCell className="font-medium align-top py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{dim.name}</span>
                        <PriorityIndicator preference={preferences.find(p => p.dimensionId === dim.id)} />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight italic max-w-[160px]">
                        {dim.description}
                      </p>
                    </div>
                  </TableCell>
                  {entities.map((entity: any) => {
                    const score = entity.scores.find((s: any) => s.dimension_id === dim.id);
                    return (
                      <TableCell key={`${entity.id}-${dim.id}`} className="text-center align-top py-4 border-l border-border/50">
                        <ScoreCell score={score} dimension={dim} entity={entity} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Facts Grid */}
      <div className="space-y-4 pt-4">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 px-2">
          <Info className="h-5 w-5 text-accent" />
          Quick Facts
        </h3>
        
        <div className="border border-border rounded-2xl overflow-hidden bg-surface">
          <Table>
            <TableBody>
              <FactRow label="Developer" icon={<Building2 className="h-3 w-3" />} entities={entities} selector={(e) => e.builderData?.builder?.name} />
              <FactRow label="Location" icon={<MapPin className="h-3 w-3" />} entities={entities} selector={(e) => e.placeData?.name} />
              <FactRow label="Possession" icon={<Calendar className="h-3 w-3" />} entities={entities} selector={(e) => e.projectData.project.possession_date || e.projectData.project.metrics?.possessionYear} />
              <FactRow label="Price Range" icon={<Target className="h-3 w-3" />} entities={entities} selector={(e) => e.projectData.project.metrics?.priceRange || (e.projectData.project.starting_price ? `₹${(e.projectData.project.starting_price / 10000000).toFixed(2)} Cr+` : null)} />
              <FactRow label="RERA" icon={<FileText className="h-3 w-3" />} entities={entities} selector={(e) => e.projectData.project.rera_number || e.projectData.project.rera?.number} />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Risks & Promises Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <IntelligenceSection 
          title="Top Risks" 
          icon={<TriangleAlert className="h-5 w-5 text-destructive" />}
          entities={entities}
          render={(e) => (
            <ul className="space-y-2 mt-2">
              {e.projectData.risks.length > 0 ? (
                e.projectData.risks.slice(0, 2).map((r: any) => (
                  <li key={r.id} className="text-xs flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
                    <span className="font-medium text-foreground">{r.title}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No verified risks reported</li>
              )}
            </ul>
          )}
        />
        <IntelligenceSection 
          title="Key Promises" 
          icon={<ShieldCheck className="h-5 w-5 text-success" />}
          entities={entities}
          render={(e) => (
            <ul className="space-y-2 mt-2">
              {e.projectData.promises.length > 0 ? (
                e.projectData.promises.slice(0, 2).map((p: any) => (
                  <li key={p.id} className="text-xs flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0 mt-1.5" />
                    <span className="font-medium text-foreground">{p.promise}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground italic">No verified promises reported</li>
              )}
            </ul>
          )}
        />
      </div>
    </div>
  );
}

function ScoreCell({ score, dimension, entity }: { score: any, dimension: any, entity: any }) {
  if (!score) {
    return <span className="text-xs text-muted-foreground italic">Assessment Pending</span>;
  }

  const provenance = DecisionScoreService.classifyProvenance(score);
  
  if (provenance === "UNUSABLE" || provenance === "PLACEHOLDER") {
    return <span className="text-xs text-muted-foreground italic">Assessment Pending</span>;
  }

  // Determine Source Attribution
  let source = "NestHunt Analysis";
  if (dimension.compatibility_group === 'place_standard_v1') {
    source = `${entity.placeData?.name || 'Place'} Intelligence`;
  } else if (dimension.compatibility_group === 'builder_standard_v1') {
    source = `${entity.builderData?.builder?.name || 'Builder'} Intelligence`;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center">
        <span className="text-xl font-display font-bold text-foreground">
          {score.score.toFixed(1)}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">/ 10</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-muted-foreground/20 text-muted-foreground font-normal whitespace-nowrap">
          {source}
        </Badge>
        {provenance === 'VERIFIED' && (
          <Badge className="text-[8px] px-1.5 py-0 bg-success/10 text-success border-success/20 font-bold tracking-tighter uppercase">
            Verified
          </Badge>
        )}
      </div>
    </div>
  );
}

function PriorityIndicator({ preference }: { preference: any }) {
  if (!preference || preference.priority === 'none') return null;
  
  const colors = {
    high: "text-accent fill-accent",
    medium: "text-accent/60",
    low: "text-accent/30"
  };

  return (
    <Target className={cn("h-3 w-3", colors[preference.priority as keyof typeof colors])} />
  );
}

function FactRow({ label, icon, entities, selector }: { label: string, icon: React.ReactNode, entities: any[], selector: (e: any) => any }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-[200px] align-top py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
      </TableCell>
      {entities.map(e => (
        <TableCell key={e.id} className="text-center align-top py-4 border-l border-border/50">
          <span className="text-sm font-medium">{selector(e) || <span className="text-muted-foreground italic">Not available</span>}</span>
        </TableCell>
      ))}
    </TableRow>
  );
}

function IntelligenceSection({ title, icon, entities, render }: { title: string, icon: React.ReactNode, entities: any[], render: (e: any) => React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg flex items-center gap-2 px-2">
        {icon}
        {title}
      </h3>
      <div className={cn(
        "grid gap-4",
        entities.length === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {entities.map(e => (
          <Card key={e.id} className="border-border bg-surface shadow-none h-full">
            <CardContent className="p-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 border-b border-border/50 pb-2">
                {e.name}
              </h4>
              {render(e)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ComparisonLoadingState({ count }: { count: number }) {
  return (
    <div className="space-y-12">
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="hidden md:block" />
        <div className={cn("grid gap-4", count === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[16/9] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
