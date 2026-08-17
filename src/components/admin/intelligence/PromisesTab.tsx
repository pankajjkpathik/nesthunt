import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, TextField, TextareaField } from "@/components/admin/form/Fields";
import {
  usePromiseLedger,
} from "@/hooks/useDecisionIntelligence";
import {
  useCreatePromise,
  useUpdatePromise,
  useDeletePromise,
} from "@/hooks/useAdminDecisionIntelligence";
import { 
  PROMISE_STATUSES,
  type PromiseLedgerRow as DecisionPromiseRow
} from "@/lib/services/decision-intelligence";

export function PromisesTab({ entityType, entityId }: { entityType: "project" | "builder" | "place", entityId?: string }) {
  const { data = [], isLoading } = usePromiseLedger(entityType, entityId);
  const create = useCreatePromise();

  if (!entityId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the {entityType} first to track promises.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Promise Ledger</h3>
          <p className="text-xs text-muted-foreground">
            Development commitments and announcements, with delivery status.
          </p>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            try {
              await create.mutateAsync({ entity_id: entityId, entity_type: entityType, promise: "New promise", status: "planned" } as any);
              toast.success("Promise added");
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add promise
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No promises tracked yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((row: DecisionPromiseRow) => (
            <PromiseRow key={row.id} row={row} entityId={entityId} entityType={entityType} />
          ))}
        </div>
      )}
    </div>
  );
}

function PromiseRow({
  row,
  entityId,
  entityType,
}: {
  row: DecisionPromiseRow;
  entityId: string;
  entityType: string;
}) {
  const [draft, setDraft] = useState<DecisionPromiseRow>(row);
  const [dirty, setDirty] = useState(false);
  const update = useUpdatePromise();
  const remove = useDeletePromise(entityId, entityType as any);

  function edit<K extends keyof DecisionPromiseRow>(key: K, value: DecisionPromiseRow[K]) {
    setDraft((d: DecisionPromiseRow) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  async function save() {
    try {
      await update.mutateAsync({
        id: row.id,
        patch: {
          promise: draft.promise,
          announced_by: draft.announced_by,
          announcement_date: draft.announcement_date,
          expected_completion: draft.expected_completion,
          actual_completion: draft.actual_completion,
          status: draft.status,
          remarks: draft.remarks,
          last_verified: draft.last_verified,
        },
      });
      setDirty(false);
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const statusColor: Record<string, string> = {
    Completed: "bg-success/10 text-success",
    "In Progress": "bg-accent/10 text-accent",
    Delayed: "bg-warning/10 text-warning",
    Cancelled: "bg-destructive/10 text-destructive",
    Planned: "bg-muted text-muted-foreground",
  };

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${statusColor[draft.status] ?? statusColor.Planned}`}>
            {draft.status}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this promise?")) return;
              await remove.mutateAsync(row.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="md:col-span-2">
          <TextareaField label="Promise" rows={2} value={draft.promise} onChange={(v) => edit("promise", v)} />
        </div>

        <TextField label="Announced by" value={draft.announced_by ?? ""} onChange={(v) => edit("announced_by", v)} />
        <Field label="Current status">
          <Select value={draft.status} onValueChange={(v) => edit("status", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROMISE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Announcement date">
          <input
            type="date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.announcement_date ?? ""}
            onChange={(e) => edit("announcement_date", e.target.value || null)}
          />
        </Field>
        <Field label="Expected completion">
          <input
            type="date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.expected_completion ?? ""}
            onChange={(e) => edit("expected_completion", e.target.value || null)}
          />
        </Field>
        <Field label="Last verified">
          <input
            type="date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.last_verified ?? ""}
            onChange={(e) => edit("last_verified", e.target.value || null)}
          />
        </Field>
        <Field label="Actual completion">
          <input
            type="date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.actual_completion ?? ""}
            onChange={(e) => edit("actual_completion", e.target.value || null)}
          />
        </Field>

        <div className="md:col-span-2">
          <TextareaField
            label="Remarks"
            rows={2}
            value={draft.remarks ?? ""}
            onChange={(v) => edit("remarks", v)}
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button size="sm" disabled={!dirty || update.isPending} onClick={save}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
