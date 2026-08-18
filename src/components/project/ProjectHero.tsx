import { ReactNode } from "react";
import { Building2, MapPin, BadgeInfo, Calendar, IndianRupee, LayoutGrid, ShieldCheck, Search, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SaveToJourneyButton } from "@/components/journey/SaveToJourneyButton";
import type { ProjectRow, ProjectHero as ProjectHeroMeta } from "@/lib/services/projects-admin";
import { cn } from "@/lib/utils";

interface ProjectHeroProps {
  project: ProjectRow & {
    builder?: { name: string; slug: string };
    place?: { name: string; slug: string };
  };
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const hero = (project.hero ?? {}) as ProjectHeroMeta;
  const metrics = (project.metrics ?? {}) as any;
  const rera = (project.rera ?? {}) as any;
  
  const heroImageUrl = hero.heroImageUrl || hero.coverImageUrl || (project.hero as any)?.heroImageUrl;
  const status = project.construction_status || project.status || "Status information unavailable";
  
  const formattedPrice = project.starting_price 
    ? `₹${(project.starting_price / 10000000).toFixed(2)} Cr+`
    : metrics.priceRange || "Price on request";

  // Granular Evidence Logic
  const reraStatus = (project.rera_number || rera.number) ? 'VERIFIED' : 'NOT AVAILABLE';
  
  // Latest progress extraction
  const latestProgress = project.progress && project.progress.length > 0 
    ? project.progress[project.progress.length - 1] 
    : null;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-accent border-accent/20 font-mono text-[10px] uppercase tracking-wider">
                Project Intelligence
              </Badge>
              {reraStatus === 'VERIFIED' && (
                <EvidenceBadge type="VERIFIED" label="RERA REGISTERED" />
              )}
              {latestProgress && (
                <EvidenceBadge type="OFFICIAL UPDATE" label="PROGRESS LOGGED" />
              )}
              {!project.starting_price && (
                <EvidenceBadge type="NOT AVAILABLE" label="PRICE UNAVAILABLE" />
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {project.name}
              </h1>
              <SaveToJourneyButton
                type="project"
                id={project.id}
                name={project.name}
                size="sm"
                className="hidden sm:flex"
              />
            </div>
            <div className="flex sm:hidden mt-4">
              <SaveToJourneyButton
                type="project"
                id={project.id}
                name={project.name}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-4">
              {project.place && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{project.place.name}</span>
                </div>
              )}
              {project.builder && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{project.builder.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <HeroMetric 
              icon={<BadgeInfo className="h-4 w-4" />}
              label="Status"
              value={status}
              className="capitalize"
              status={latestProgress ? "OFFICIAL UPDATE" : "REPORTED"}
            />
            <HeroMetric 
              icon={<IndianRupee className="h-4 w-4" />}
              label="Starting Price"
              value={formattedPrice}
              status={project.starting_price ? "VERIFIED" : "NOT AVAILABLE"}
            />
            <HeroMetric 
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Configuration"
              value={metrics.unitTypes || "Residences"}
              status="REPORTED"
            />
          </div>
        </div>

        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
          {heroImageUrl ? (
            <img 
              src={heroImageUrl} 
              alt={project.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center text-muted-foreground/30 space-y-3">
              <Building2 className="h-16 w-16" />
              <span className="text-xs font-medium uppercase tracking-widest">Project imagery unavailable</span>
            </div>
          )}
          {latestProgress && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-border px-3 py-1 text-[10px] font-bold">
                <Clock className="h-3 w-3 mr-1.5 text-accent inline" />
                Latest Official Update: {latestProgress.split(':')[1]?.split('(')[0]?.trim() || latestProgress}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceBadge({ type, label }: { type: 'VERIFIED' | 'OFFICIAL UPDATE' | 'REPORTED' | 'NOT AVAILABLE', label: string }) {
  const styles = {
    'VERIFIED': 'bg-success/10 text-success border-success/20',
    'OFFICIAL UPDATE': 'bg-accent/10 text-accent border-accent/20',
    'REPORTED': 'bg-warning/10 text-warning border-warning/20',
    'NOT AVAILABLE': 'bg-muted text-muted-foreground border-muted-foreground/20'
  };

  const icons = {
    'VERIFIED': <ShieldCheck className="h-2.5 w-2.5" />,
    'OFFICIAL UPDATE': <Clock className="h-2.5 w-2.5" />,
    'REPORTED': <Info className="h-2.5 w-2.5" />,
    'NOT AVAILABLE': <Search className="h-2.5 w-2.5" />
  };

  return (
    <Badge variant="secondary" className={cn("text-[9px] uppercase tracking-wider flex items-center gap-1 font-bold", styles[type])}>
      {icons[type]}
      {label}
    </Badge>
  );
}

function HeroMetric({ icon, label, value, className, status }: { icon: ReactNode; label: string; value: string; className?: string; status?: string }) {
  return (
    <Card className="border-border bg-surface shadow-none overflow-hidden group">
      <CardContent className="p-4 relative">
        <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
        <div className={cn("font-display font-bold text-foreground truncate", className)}>
          {value}
        </div>
        {status && (
          <div className={cn(
            "mt-2 text-[8px] font-bold uppercase tracking-tighter opacity-70",
            status === 'VERIFIED' ? 'text-success' : 
            status === 'OFFICIAL UPDATE' ? 'text-accent' :
            status === 'NOT AVAILABLE' ? 'text-muted-foreground' : 'text-warning'
          )}>
            ● {status}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
