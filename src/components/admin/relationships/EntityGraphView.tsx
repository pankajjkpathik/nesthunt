import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Loader2, Network } from "lucide-react";
import { useEntityGraph } from "@/hooks/useRelationships";
import type { EntityRef, GraphNode } from "@/types/relationships";
import { ENTITY_LABELS } from "@/types/relationships";

interface Props {
  entity: EntityRef;
  depth?: 0 | 1 | 2;
}

export function EntityGraphView({ entity, depth = 1 }: Props) {
  const { data, isLoading } = useEntityGraph(entity, depth);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <header className="flex items-center gap-2">
          <Network className="h-4 w-4 text-accent" />
          <h4 className="text-sm font-semibold">Knowledge graph</h4>
        </header>

        {isLoading || !data ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Building graph…
          </div>
        ) : (
          <NodeView node={data} isRoot />
        )}
      </CardContent>
    </Card>
  );
}

function NodeView({ node, isRoot }: { node: GraphNode; isRoot?: boolean }) {
  return (
    <div className={isRoot ? "" : "ml-3 border-l border-border pl-3"}>
      <div className="flex items-center gap-2">
        <span className={isRoot ? "text-sm font-semibold" : "text-sm"}>{node.label}</span>
        <Badge variant="outline" className="text-[10px] uppercase">
          {ENTITY_LABELS[node.ref.type]}
        </Badge>
      </div>
      {node.children.length ? (
        <div className="mt-2 space-y-3">
          {node.children.map((child) => (
            <div key={child.kind}>
              <div className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                <ChevronRight className="h-3 w-3" /> {child.label}
              </div>
              <div className="space-y-1">
                {child.nodes.map((n) => (
                  <NodeView key={`${n.ref.type}:${n.ref.id}`} node={n} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : isRoot ? (
        <p className="mt-2 text-xs text-muted-foreground">No linked entities yet.</p>
      ) : null}
    </div>
  );
}
