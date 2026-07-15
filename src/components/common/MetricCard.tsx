import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

/**
 * Compact key-value card for surfacing a single verified metric.
 */
export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card className="rounded-xl border-border bg-surface shadow-none transition-shadow hover:shadow-card">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
