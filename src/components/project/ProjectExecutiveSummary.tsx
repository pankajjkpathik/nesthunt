import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ProjectExecutiveSummaryProps {
  summary: string | null;
}

export function ProjectExecutiveSummary({ summary }: ProjectExecutiveSummaryProps) {
  if (!summary) return null;

  return (
    <section aria-labelledby="summary-heading">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-accent" />
        <h2 id="summary-heading" className="font-display text-2xl font-bold text-foreground">
          Executive Summary
        </h2>
      </div>
      <Card className="border-border bg-surface shadow-none overflow-hidden">
        <div className="h-1 w-full bg-accent/20" />
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
