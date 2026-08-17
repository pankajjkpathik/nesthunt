import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  MapPin, 
  LayoutGrid, 
  BadgeCheck, 
  Calendar, 
  SquareAsterisk,
  Coins,
  FileText
} from "lucide-react";
import type { ProjectRow } from "@/lib/services/projects-admin";
import { ReactNode } from "react";

interface ProjectQuickFactsProps {
  project: ProjectRow & {
    builder?: { name: string; slug: string };
    place?: { name: string; slug: string };
  };
}

export function ProjectQuickFacts({ project }: ProjectQuickFactsProps) {
  const metrics = project.metrics ?? {};
  const rera = project.rera ?? {};

  const facts = [
    { 
      label: "Developer", 
      value: project.builder?.name, 
      icon: <Building2 className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Location", 
      value: project.place?.name, 
      icon: <MapPin className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Property Type", 
      value: project.property_type || metrics.unitTypes, 
      icon: <LayoutGrid className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Project Status", 
      value: project.construction_status || project.status, 
      icon: <BadgeCheck className="h-3.5 w-3.5" />,
      className: "capitalize"
    },
    { 
      label: "Total Units", 
      value: metrics.totalUnits ? String(metrics.totalUnits) : null, 
      icon: <SquareAsterisk className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Launch Date", 
      value: project.launch_date, 
      icon: <Calendar className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Possession", 
      value: project.possession_date || (metrics.possessionYear ? String(metrics.possessionYear) : null), 
      icon: <Calendar className="h-3.5 w-3.5" /> 
    },
    { 
      label: "RERA Number", 
      value: project.rera_number || rera.number, 
      icon: <FileText className="h-3.5 w-3.5" /> 
    },
    { 
      label: "Price Range", 
      value: metrics.priceRange || (project.starting_price ? `From ₹${(project.starting_price / 10000000).toFixed(2)} Cr` : null), 
      icon: <Coins className="h-3.5 w-3.5" /> 
    },
  ].filter(f => f.value);

  if (facts.length === 0) return null;

  return (
    <Card className="border-border bg-surface shadow-none sticky top-8">
      <CardContent className="p-6">
        <h3 className="font-display font-bold text-lg mb-6 text-foreground">Quick Facts</h3>
        <dl className="space-y-6">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="flex items-center gap-2 text-muted-foreground uppercase text-[10px] font-bold tracking-widest mb-1.5">
                {fact.icon}
                {fact.label}
              </dt>
              <dd className={cn("text-sm font-medium text-foreground", fact.className)}>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
