import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CategoryRating {
  label: string;
  score: number; // 0-10
}

interface DecisionScoreCardProps {
  title: string;
  score: number; // 0-10 or 0-100
  scale?: 10 | 100;
  confidence: "Low" | "Medium" | "High";
  categoryRatings?: CategoryRating[];
  verdict?: string;
  className?: string;
}

/**
 * DecisionScoreCard — canonical scoring surface for places, builders and
 * projects. Renders a headline score, confidence, category-level bars, and
 * an optional verdict summary.
 */
export function DecisionScoreCard({
  title,
  score,
  scale = 10,
  confidence,
  categoryRatings,
  verdict,
  className,
}: DecisionScoreCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border-border bg-surface shadow-none",
        className,
      )}
    >
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {score}
              <span className="ml-1 text-xl font-normal text-muted-foreground">
                / {scale}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Confidence
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground">
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  confidence === "High" && "bg-success",
                  confidence === "Medium" && "bg-warning",
                  confidence === "Low" && "bg-destructive",
                )}
              />
              {confidence}
            </p>
          </div>
        </div>

        {categoryRatings && categoryRatings.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categoryRatings.map((c) => {
              const pct = Math.max(0, Math.min(100, (c.score / 10) * 100));
              return (
                <div key={c.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {c.label}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {c.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {verdict && (
          <div className="mt-8 rounded-lg border-l-2 border-accent bg-muted/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              NestHunt Verdict
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {verdict}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
