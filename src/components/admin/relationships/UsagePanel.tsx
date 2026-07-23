import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity } from "lucide-react";
import { useEntityUsage } from "@/hooks/useRelationships";
import type { EntityRef, EntityType } from "@/types/relationships";
import { ENTITY_LABELS } from "@/types/relationships";

interface Props {
  entity: EntityRef;
}

export function UsagePanel({ entity }: Props) {
  const { data, isLoading } = useEntityUsage(entity);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <header className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          <h4 className="text-sm font-semibold">Used in</h4>
        </header>

        {isLoading || !data ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading usage…
          </div>
        ) : data.total === 0 ? (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Not referenced anywhere.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.byType).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {ENTITY_LABELS[type as EntityType]}: {count}
                </Badge>
              ))}
            </div>
            {data.samples.length ? (
              <ul className="divide-y divide-border rounded border border-border text-sm">
                {data.samples.map((s) => (
                  <li key={`${s.type}:${s.id}`} className="flex items-center justify-between p-2">
                    <span className="truncate">{s.name}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {ENTITY_LABELS[s.type]}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
