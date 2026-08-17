import { Card, CardContent } from "@/components/ui/card";
import { Building2, LayoutGrid, Ruler, IndianRupee, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectConfigurationsProps {
  unitTypes: any;
}

export function ProjectConfigurations({ unitTypes }: ProjectConfigurationsProps) {
  if (!unitTypes || (Array.isArray(unitTypes) && unitTypes.length === 0)) return null;

  const units = Array.isArray(unitTypes) ? unitTypes : [];
  if (units.length === 0) return null;

  return (
    <section id="configurations" aria-labelledby="config-heading">
      <h2 id="config-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
        Available Configurations
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit: any, idx: number) => (
          <Card key={idx} className="border-border bg-surface shadow-none group hover:border-accent/40 transition-colors">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">{unit.type}</h3>
                </div>
                {unit.availability && (
                  <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest border-muted-foreground/20 text-muted-foreground">
                    {unit.availability}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Ruler className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Area</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {unit.area || unit.sizeRange || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <IndianRupee className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Price</span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {unit.priceRange || "On Request"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
