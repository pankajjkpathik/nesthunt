import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2, ImageIcon } from "lucide-react";
import { EntityPicker } from "./EntityPicker";
import {
  useAttachEntity,
  useDetachEntity,
  useRelatedEntities,
} from "@/hooks/useRelationships";
import type { EntityRef, EntityType } from "@/types/relationships";
import { ENTITY_LABELS } from "@/types/relationships";

interface Props {
  from: EntityRef;
  toType: EntityType;
  kind: string;
  label: string;
  multiple?: boolean;
  description?: string;
}

export function RelationshipPanel({
  from,
  toType,
  kind,
  label,
  multiple = true,
  description,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: related, isLoading } = useRelatedEntities(from, kind);
  const attach = useAttachEntity();
  const detach = useDetachEntity();

  const items = related ?? [];
  const excludeIds = items.map((i) => i.id);

  async function onPicked(picked: { type: EntityType; id: string }[]) {
    for (const p of picked) {
      try {
        await attach.mutateAsync({
          from,
          to: { type: p.type, id: p.id },
          kind,
        });
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
    if (picked.length) toast.success(`Attached ${picked.length} ${label.toLowerCase()}`);
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <header className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">{label}</h4>
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPickerOpen(true)}
            disabled={!multiple && items.length >= 1}
          >
            <Plus className="mr-1 h-3 w-3" />
            Attach
          </Button>
        </header>

        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No {label.toLowerCase()} linked yet.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded border border-border">
            {items.map((r) => (
              <li key={r.relationshipId} className="flex items-center gap-3 p-2">
                {r.thumbnail ? (
                  <img
                    src={r.thumbnail}
                    alt=""
                    className="h-9 w-9 rounded border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-muted/40">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  {r.subtitle ? (
                    <div className="truncate text-xs text-muted-foreground">{r.subtitle}</div>
                  ) : null}
                </div>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {ENTITY_LABELS[r.type]}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    detach.mutate({
                      relationshipId: r.relationshipId,
                      from,
                      to: { type: r.type, id: r.id },
                    })
                  }
                  aria-label={`Remove ${r.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <EntityPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={onPicked}
          types={[toType]}
          multiple={multiple}
          excludeIds={excludeIds}
          title={`Attach ${label.toLowerCase()}`}
        />
      </CardContent>
    </Card>
  );
}
