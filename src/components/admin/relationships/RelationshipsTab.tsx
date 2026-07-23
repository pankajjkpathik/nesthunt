import { RelationshipPanel } from "./RelationshipPanel";
import { EntityGraphView } from "./EntityGraphView";
import { UsagePanel } from "./UsagePanel";
import type { EntityRef } from "@/types/relationships";
import { getRelationshipsFor } from "@/types/relationships";

interface Props {
  entity: EntityRef;
}

/**
 * Bundles every relationship panel supported by the given entity type,
 * plus a graph + usage overview. Used by all editor "Relationships" tabs.
 */
export function RelationshipsTab({ entity }: Props) {
  const defs = getRelationshipsFor(entity.type);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        {defs.map((d) => (
          <RelationshipPanel
            key={d.kind}
            from={entity}
            toType={d.toType}
            kind={d.kind}
            label={d.label}
            multiple={d.multiple}
            description={d.description}
          />
        ))}
      </div>
      <div className="space-y-4">
        <EntityGraphView entity={entity} />
        <UsagePanel entity={entity} />
      </div>
    </div>
  );
}
