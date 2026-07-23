import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { getUsage } from "@/lib/services/relationships";
import type { EntityRef, EntityType, UsageReport } from "@/types/relationships";
import { ENTITY_LABELS } from "@/types/relationships";

interface Props {
  entity: EntityRef | null;
  entityName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  actionLabel?: string;
}

/**
 * Fetches dependency counts for `entity` and asks the admin to confirm the
 * destructive action. Used by delete flows across Places, Builders, Projects
 * and the Media Library.
 */
export function DependencyDialog({
  entity,
  entityName,
  open,
  onOpenChange,
  onConfirm,
  actionLabel = "Delete",
}: Props) {
  const [usage, setUsage] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open || !entity) {
      setUsage(null);
      return;
    }
    setLoading(true);
    getUsage(entity)
      .then(setUsage)
      .catch(() => setUsage({ target: entity, total: 0, byType: {}, samples: [] }))
      .finally(() => setLoading(false));
  }, [open, entity]);

  async function handleConfirm() {
    try {
      setConfirming(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setConfirming(false);
    }
  }

  const dependencies = usage?.total ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {dependencies > 0 ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : null}
            {actionLabel} {entityName ?? "entity"}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking dependencies…
                </div>
              ) : dependencies === 0 ? (
                <p>This entity has no linked content and can be safely deleted.</p>
              ) : (
                <>
                  <p>
                    This is referenced by <strong>{dependencies}</strong> other
                    item{dependencies === 1 ? "" : "s"}. Deleting may leave broken
                    links.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(usage?.byType ?? {}).map(([type, count]) => (
                      <Badge key={type} variant="secondary">
                        {ENTITY_LABELS[type as EntityType]}: {count}
                      </Badge>
                    ))}
                  </div>
                  {usage?.samples.length ? (
                    <ul className="max-h-40 overflow-y-auto rounded border border-border text-sm">
                      {usage.samples.map((s) => (
                        <li key={`${s.type}:${s.id}`} className="flex items-center justify-between border-b border-border px-2 py-1 last:border-0">
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
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={confirming}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirming ? "Working…" : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
