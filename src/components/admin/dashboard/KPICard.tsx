import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { KPIStat } from "@/types/dashboard";

interface Props {
  stat: KPIStat;
  loading?: boolean;
}

const toneMap: Record<NonNullable<KPIStat["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

export function KPICard({ stat, loading }: Props) {
  const Icon = stat.icon;
  const tone = toneMap[stat.tone ?? "default"];
  const trendIcon =
    stat.trend?.direction === "up" ? ArrowUpRight : stat.trend?.direction === "down" ? ArrowDownRight : Minus;
  const TrendIcon = trendIcon;

  return (
    <Card className="border-border bg-surface transition-shadow hover:shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {stat.label}
          </p>
          <Icon className={cn("h-4 w-4", tone)} />
        </div>

        <div className="mt-3">
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {stat.value === "—" || stat.value === 0 ? (
                <span className="text-muted-foreground">{stat.value === 0 ? "0" : "—"}</span>
              ) : (
                stat.value
              )}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {stat.description ? (
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          ) : (
            <span />
          )}
          {stat.trend && !loading ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-medium",
                stat.trend.direction === "up" && "text-success",
                stat.trend.direction === "down" && "text-error",
                stat.trend.direction === "flat" && "text-muted-foreground",
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {stat.trend.value}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
