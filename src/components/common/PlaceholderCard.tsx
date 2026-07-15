import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Empty-state style card that reserves space for a future module.
 * Used across placeholder routes during scaffolding.
 */
export function PlaceholderCard({
  title,
  description,
  icon,
  className,
}: PlaceholderCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-dashed border-border bg-surface shadow-none",
        className,
      )}
    >
      <CardContent className="flex flex-col items-start gap-3 p-6">
        {icon && (
          <div className="grid h-9 w-9 place-items-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
