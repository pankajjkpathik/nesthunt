import { Building2, Boxes, Image as ImageIcon, MapPin, Settings, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/types/dashboard";

const iconMap = {
  place: MapPin,
  builder: Building2,
  project: Boxes,
  media: ImageIcon,
  user: User,
  system: Settings,
} as const;

export function RecentActivity({ items, loading }: { items?: ActivityItem[]; loading?: boolean }) {
  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted/40" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet. It'll appear here as your team works.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {items.map((a) => {
              const Icon = iconMap[a.entityType];
              return (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{a.user}</span>{" "}
                      <span className="text-muted-foreground">{a.action.toLowerCase()}</span>{" "}
                      <span className="font-medium">{a.entity}</span>
                    </p>
                    <time className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelative(a.timestamp)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
