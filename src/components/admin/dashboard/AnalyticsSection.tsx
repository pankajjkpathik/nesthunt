import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types/dashboard";

interface Props {
  data?: AnalyticsSummary;
  loading?: boolean;
}

export function AnalyticsSection({ data, loading }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartContainer title="Properties by City" icon={BarChart3}>
        {loading || !data ? (
          <ChartSkeleton />
        ) : data.propertiesByCity.length === 0 ? (
          <EmptyState label="No city data yet" />
        ) : (
          <BarsPlaceholder items={data.propertiesByCity} />
        )}
      </ChartContainer>

      <ChartContainer title="Published vs Draft" icon={PieChart}>
        {loading || !data ? (
          <ChartSkeleton />
        ) : (
          <DonutPlaceholder
            published={data.publishedVsDraft.published}
            draft={data.publishedVsDraft.draft}
            review={data.publishedVsDraft.review}
          />
        )}
      </ChartContainer>

      <ChartContainer title="Monthly Growth" icon={TrendingUp}>
        {loading || !data ? <ChartSkeleton /> : <BarsPlaceholder items={data.monthlyGrowth.map((m) => ({ label: m.month, value: m.value }))} />}
      </ChartContainer>

      <ChartContainer title="User Activity" icon={Users}>
        {loading || !data ? <ChartSkeleton /> : <BarsPlaceholder items={data.userActivity.map((d) => ({ label: d.day, value: d.value }))} />}
      </ChartContainer>
    </div>
  );
}

function ChartContainer({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BarChart3;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border bg-surface">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="h-56 pt-0">{children}</CardContent>
    </Card>
  );
}

function BarsPlaceholder({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex h-full items-end gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-accent/70 transition-all hover:bg-accent"
            style={{ height: `${(i.value / max) * 80 + 6}%` }}
            title={`${i.label}: ${i.value}`}
          />
          <span className="truncate text-[10px] text-muted-foreground">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutPlaceholder({ published, draft, review }: { published: number; draft: number; review: number }) {
  const total = Math.max(1, published + draft + review);
  const pctP = Math.round((published / total) * 100);
  const pctR = Math.round((review / total) * 100);
  const pctD = 100 - pctP - pctR;
  const style = {
    background: `conic-gradient(var(--success) 0 ${pctP}%, var(--warning) ${pctP}% ${pctP + pctR}%, var(--muted-foreground) ${pctP + pctR}% 100%)`,
  };
  return (
    <div className="flex h-full items-center gap-6">
      <div className="relative h-32 w-32 shrink-0 rounded-full" style={style}>
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-surface">
          <span className="font-display text-lg font-semibold text-foreground">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
        </div>
      </div>
      <ul className="space-y-2 text-xs">
        <LegendRow color="bg-success" label="Published" value={published} />
        <LegendRow color="bg-warning" label="In review" value={review} />
        <LegendRow color="bg-muted-foreground" label="Drafts" value={draft} />
      </ul>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground">{value}</span>
    </li>
  );
}

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-md bg-muted/40" />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
