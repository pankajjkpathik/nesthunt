import { useState, useMemo } from "react";
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
  type EntityRiskRow as DecisionRiskRow,
} from "@/lib/services/decision-intelligence";
import {
  useProjectRisks,
} from "@/hooks/usePlaceIntelligence";
import {
  useCreateRisk,
  useUpdateRisk,
  useDeleteRisk,
} from "@/hooks/useAdminDecisionIntelligence";
import {
  RISK_CATEGORIES,
  RISK_PROBABILITIES,
  RISK_SEVERITIES,
  RISK_STATUSES,
} from "@/lib/services/decision-intelligence";

const PAGE_SIZE = 10;

export function RisksTab({ entityType, entityId }: { entityType: "project" | "builder" | "place", entityId?: string }) {
  const { data = [], isLoading } = useProjectRisks(entityId);
  const create = useCreateRisk();
  const [page, setPage] = useState(0);

  const total = data.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = useMemo(() => data.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [data, page]);

  if (!entityId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the {entityType} first to add risks.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Risk Register</h3>
          <p className="text-xs text-muted-foreground">
            Structured risks with severity, probability, mitigation and evidence links.
          </p>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            try {
              await create.mutateAsync({ entity_id: entityId, entity_type: entityType, title: "New risk", severity: "medium", probability: "medium" } as any);
              toast.success("Risk added");
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add risk
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading risks…
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No risks yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map((row: DecisionRiskRow) => (
              <RiskRow key={row.id} row={row} entityId={entityId} entityType={entityType} />
            ))}
          </div>
          {pageCount > 1 ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {page + 1} of {pageCount} — {total} risks
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={page + 1 >= pageCount} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function RiskRow({ row, entityId, entityType }: { row: DecisionRiskRow; entityId: string; entityType: string }) {
  const [draft, setDraft] = useState<DecisionRiskRow>(row);
  const [dirty, setDirty] = useState(false);
  const update = useUpdateRisk();
  const remove = useDeleteRisk(entityId, entityType as any);

  function edit<K extends keyof DecisionRiskRow>(key: K, value: DecisionRiskRow[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }

  async function save() {
    try {
      await update.mutateAsync({
        id: row.id,
        patch: {
          title: draft.title,
          category: draft.category,
          severity: draft.severity,
          probability: draft.probability,
          description: draft.description,
          mitigation: draft.mitigation,
          status: draft.status,
        },
      });
      setDirty(false);
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const severityColor: Record<string, string> = {
    critical: "bg-destructive/10 text-destructive",
    high: "bg-warning/10 text-warning",
    medium: "bg-accent/10 text-accent",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">{draft.category}</Badge>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${severityColor[draft.severity]}`}>
              {draft.severity} severity
            </span>
            <Badge variant="secondary" className="text-[10px] uppercase">{draft.probability} probability</Badge>
            <Badge variant="outline" className="text-[10px] uppercase">{draft.status}</Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this risk?")) return;
              await remove.mutateAsync(row.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <TextField label="Title" value={draft.title ?? ""} onChange={(v) => edit("title", v)} />
        <Field label="Category">
          <Select value={draft.category ?? "financial"} onValueChange={(v) => edit("category", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Severity">
          <Select value={draft.severity} onValueChange={(v) => edit("severity", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_SEVERITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Probability">
          <Select value={draft.probability} onValueChange={(v) => edit("probability", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_PROBABILITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={draft.status} onValueChange={(v) => edit("status", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RISK_STATUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <div className="md:col-span-2">
          <TextareaField
            label="Description"
            rows={3}
            value={draft.description ?? ""}
            onChange={(v) => edit("description", v)}
          />
        </div>
        <div className="md:col-span-2">
          <TextareaField
            label="Mitigation plan"
            rows={3}
            value={draft.mitigation ?? ""}
            onChange={(v) => edit("mitigation", v)}
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
