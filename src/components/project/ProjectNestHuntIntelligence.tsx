import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Search,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import type { DecisionEntityRow, DecisionInsightRow } from "@/lib/services/decision-intelligence";
import type { ProjectRow } from "@/lib/services/projects-admin";
import { cn } from "@/lib/utils";

interface ProjectNestHuntIntelligenceProps {
  project: ProjectRow;
  decisionEntity: DecisionEntityRow | null;
  insights: DecisionInsightRow[];
}

export function ProjectNestHuntIntelligence({ project, decisionEntity, insights }: ProjectNestHuntIntelligenceProps) {
  const metrics = (project.metrics || {}) as any;
  const rera = (project.rera || {}) as any;

  // 1. What we know
  const knowns = [
    { label: "Verified project identity", exists: !!project.name },
    { label: "Builder relationship", exists: !!project.builder_id },
    { label: "Place relationship", exists: !!project.place_id },
    { label: "RERA registration", exists: !!(project.rera_number || rera.number) },
    { label: "Configuration information", exists: project.unit_types && project.unit_types.length > 0 },
    { label: "Documented amenities", exists: project.amenities && project.amenities.length > 0 },
    { label: "Latest available official progress", exists: project.progress && project.progress.length > 0 },
  ].filter(k => k.exists);

  // 2. What remains to verify
  const unknowns = [
    { label: "Current market price", missing: !project.starting_price },
    { label: "Current construction percentage", missing: !project.completion_percentage },
    { label: "Unit-specific availability", missing: !metrics.totalUnits },
  ].filter(u => u.missing);

  return (
    <section id="nesthunt-intelligence" aria-labelledby="intel-heading">
      <Card className="border-border bg-surface shadow-none overflow-hidden border-l-4 border-l-accent">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="h-6 w-6 text-accent" />
            <h2 id="intel-heading" className="font-display text-2xl font-bold text-foreground">
              NestHunt Intelligence
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                What we know
              </div>
              <ul className="space-y-3">
                {knowns.map((k, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-success/40" />
                    {k.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-warning">
                <Search className="h-3.5 w-3.5" />
                What remains to verify
              </div>
              <ul className="space-y-3">
                {unknowns.map((u, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning/40" />
                    {u.label}
                  </li>
                ))}
                {unknowns.length === 0 && (
                  <li className="text-sm text-muted-foreground italic">No major information gaps identified.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              <span className="font-bold text-foreground uppercase tracking-tight mr-1">Transparency Statement:</span>
              NestHunt Intelligence surfaces factual data from official records and field research. We do not provide numerical scores, investment ratings, or AI-generated recommendations. All information should be verified independently before making a financial decision.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
