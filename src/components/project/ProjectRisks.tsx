import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TriangleAlert,
  ShieldCheck,
  AlertTriangle,
  Info
} from "lucide-react";
import type { EntityRiskRow } from "@/lib/services/decision-intelligence";
import { cn } from "@/lib/utils";

interface ProjectRisksProps {
  risks: EntityRiskRow[];
}

export function ProjectRisks({ risks }: ProjectRisksProps) {
  if (risks.length === 0) return null;

  return (
    <section id="risks" aria-labelledby="risks-heading">
      <div className="flex items-center gap-2 mb-6">
        <TriangleAlert className="h-5 w-5 text-destructive" />
        <h2 id="risks-heading" className="font-display text-2xl font-bold text-foreground">
          Risks & Considerations
        </h2>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {risks.map((risk) => (
          <Card key={risk.id} className="border-border bg-surface shadow-none overflow-hidden group">
            <div className={cn(
              "h-1 w-full",
              risk.severity === 'critical' ? 'bg-destructive' :
              risk.severity === 'high' ? 'bg-orange-500' :
              risk.severity === 'medium' ? 'bg-warning' : 'bg-muted'
            )} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase text-[9px] font-bold tracking-widest px-2 py-0 border-muted-foreground/20 text-muted-foreground">
                      {risk.category}
                    </Badge>
                    <RiskSeverityBadge severity={risk.severity} />
                  </div>
                  <h4 className="font-display font-bold text-foreground leading-tight">{risk.title}</h4>
                </div>
                {risk.status === 'resolved' || risk.status === 'mitigated' ? (
                  <Badge className="bg-success/10 text-success border-success/20 text-[10px] py-0">
                    {risk.status}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {risk.description}
              </p>
              
              {risk.mitigation && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    <ShieldCheck className="h-3 w-3 text-success" />
                    Mitigation Plan
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 italic">
                    {risk.mitigation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function RiskSeverityBadge({ severity }: { severity: string | null }) {
  if (!severity) return null;
  
  const config: Record<string, { label: string, color: string, icon: any }> = {
    critical: { label: "Critical", color: "text-destructive bg-destructive/10 border-destructive/20", icon: AlertTriangle },
    high: { label: "High", color: "text-orange-600 bg-orange-100 border-orange-200", icon: AlertTriangle },
    medium: { label: "Medium", color: "text-warning bg-warning/10 border-warning/20", icon: Info },
    low: { label: "Low", color: "text-muted-foreground bg-muted border-none", icon: Info },
  };

  const item = config[severity.toLowerCase()] || config.low;
  const Icon = item.icon;

  return (
    <Badge className={cn("text-[9px] uppercase font-bold tracking-widest px-2 py-0 flex items-center gap-1", item.color)}>
      <Icon className="h-2.5 w-2.5" />
      {item.label}
    </Badge>
  );
}
