import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb,
  Info,
  Activity,
  BarChart
} from "lucide-react";
import type { DecisionEntityRow, DecisionInsightRow } from "@/lib/services/decision-intelligence";
import { cn } from "@/lib/utils";

interface ProjectIntelligenceSummaryProps {
  decisionEntity: DecisionEntityRow | null;
  insights: DecisionInsightRow[];
}

export function ProjectIntelligenceSummary({ decisionEntity, insights }: ProjectIntelligenceSummaryProps) {
  if (!decisionEntity || insights.length === 0) return null;

  const categoryIcons: Record<string, any> = {
    market: <TrendingUp className="h-4 w-4 text-success" />,
    growth: <Activity className="h-4 w-4 text-success" />,
    risk: <AlertTriangle className="h-4 w-4 text-destructive" />,
    builder: <ShieldCheck className="h-4 w-4 text-success" />,
    place: <BarChart className="h-4 w-4 text-success" />,
    project: <CheckCircle2 className="h-4 w-4 text-success" />,
  };

  return (
    <section id="intelligence-summary" aria-labelledby="intel-heading">
      <Card className="border-border bg-surface shadow-sm overflow-hidden border-l-4 border-l-accent">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-5 w-5 text-accent" />
            <h2 id="intel-heading" className="font-display text-xl font-bold text-foreground">
              NestHunt Intelligence Summary
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {categoryIcons[insight.category] || <Info className="h-4 w-4 text-accent" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {insight.category} Insight
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-foreground line-clamp-2">{insight.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {insight.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">NestHunt verified:</span> This summary is based on verified regulatory data, site inspections, and builder track record audits. No automated scores are used in this assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
