import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InsightListCardProps {
  title: string;
  items: string[];
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "negative";
  className?: string;
}

const TONE = {
  neutral: "text-foreground",
  positive: "text-success",
  negative: "text-destructive",
} as const;

/**
 * Simple titled card that renders a short bulleted list. Used for
 * Strengths / Watch-outs / Opportunities / Risks surfaces.
 */
export function InsightListCard({
  title,
  items,
  icon,
  tone = "neutral",
  className,
}: InsightListCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border-border bg-surface shadow-none",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          {icon && (
            <span className={cn("inline-flex", TONE[tone])}>{icon}</span>
          )}
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
        </div>
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-foreground"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-2 h-1 w-1 shrink-0 rounded-full",
                  tone === "positive" && "bg-success",
                  tone === "negative" && "bg-destructive",
                  tone === "neutral" && "bg-accent",
                )}
              />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
