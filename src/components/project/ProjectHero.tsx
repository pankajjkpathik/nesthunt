import { ReactNode } from "react";
import { Building2, MapPin, BadgeInfo, Calendar, IndianRupee, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectRow, ProjectHero as ProjectHeroMeta } from "@/lib/services/projects-admin";

interface ProjectHeroProps {
  project: ProjectRow & {
    builder?: { name: string; slug: string };
    place?: { name: string; slug: string };
  };
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const hero = (project.hero ?? {}) as ProjectHeroMeta;
  const metrics = project.metrics ?? {};
  
  const heroImageUrl = hero.heroImageUrl || hero.coverImageUrl || project.hero?.heroImageUrl;
  const status = project.construction_status || project.status || "Status information unavailable";
  
  const formattedPrice = project.starting_price 
    ? `₹${(project.starting_price / 10000000).toFixed(2)} Cr+`
    : project.metrics.priceRange || "Price on request";

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-accent border-accent/20 font-mono text-[10px] uppercase tracking-wider">
                Project Intelligence
              </Badge>
              {project.verified && (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px] uppercase tracking-wider">
                  Verified
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
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
            />
            <HeroMetric 
              icon={<IndianRupee className="h-4 w-4" />}
              label="Starting Price"
              value={formattedPrice}
            />
            <HeroMetric 
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Configuration"
              value={metrics.unitTypes || "Residences"}
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
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
              <Building2 className="h-20 w-20" />
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground border-none px-3 py-1">
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ icon, label, value, className }: { icon: ReactNode; label: string; value: string; className?: string }) {
  return (
    <Card className="border-border bg-surface shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
          {icon}
          <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <div className={cn("font-display font-bold text-foreground truncate", className)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
