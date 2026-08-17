import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
  useDecisionEntityByRef,
  useDecisionScores,
  useUpsertDecisionScore,
  useDecisionFactors,
  useCreateDecisionFactor,
  useUpdateDecisionFactor,
  useDeleteDecisionFactor,
  useDecisionDimensions
} from "@/hooks/useDecisionIntelligence";
import { 
  FACTOR_TYPES,
  type DecisionFactorRow,
  type DecisionEntityType 
} from "@/lib/services/decision-intelligence";

interface Props {
  entityType: DecisionEntityType;
  entityId?: string;
}

export function DecisionFactorsTab({ entityType, entityId }: Props) {
  const { data: decisionEntity, isLoading: loadingEntity } = useDecisionEntityByRef(entityType, entityId);
  const { data: scores = [], isLoading: loadingScores } = useDecisionScores(decisionEntity?.id);
  const { data: dimensions = [] } = useDecisionDimensions(true);
  
  // For simplicity in Project CMS, we might use a default dimension or the first one if not complex scoring
  const defaultDimension = dimensions[0];
  const activeScore = scores[0]; // Currently assuming one score per project for strengths

  const { data: factors = [], isLoading: loadingFactors } = useDecisionFactors(activeScore?.id);
  const create = useCreateDecisionFactor();
  const upsertScore = useUpsertDecisionScore();

  if (!entityId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the {entityType} first to add strengths.
        </CardContent>
      </Card>
    );
  }

  if (loadingEntity || loadingScores || (activeScore && loadingFactors)) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading intelligence…
      </div>
    );
  }

  const handleAdd = async () => {
    try {
      let scoreId = activeScore?.id;
      
      if (!scoreId) {
        if (!decisionEntity?.id) throw new Error("Decision entity not found");
        if (!defaultDimension) throw new Error("No decision dimensions configured");
        
        const newScore = await upsertScore.mutateAsync({
          decision_entity_id: decisionEntity.id,
          dimension_id: defaultDimension.id,
          score: 0,
        });
        scoreId = newScore.id;
      }

      await create.mutateAsync({
        decision_score_id: scoreId,
        title: "New strength",
        factor_type: "positive",
        impact: 7,
        display_order: factors.length,
      });
      toast.success("Strength added");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Strengths & Decision Factors</h3>
          <p className="text-xs text-muted-foreground">
            Normalized strengths that influence the overall assessment.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add strength
        </Button>
      </div>

      {factors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No strengths added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {factors.map((f, i) => (
            <FactorRow 
              key={f.id} 
              row={f} 
              isFirst={i === 0} 
              isLast={i === factors.length - 1}
              onMove={(dir) => {/* TODO: Implement reorder if needed */}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FactorRow({ 
  row, 
  isFirst, 
  isLast,
  onMove 
}: { 
  row: DecisionFactorRow; 
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: 'up' | 'down') => void;
}) {
  const [draft, setDraft] = useState(row);
  const [dirty, setDirty] = useState(false);
  const update = useUpdateDecisionFactor();
  const remove = useDeleteDecisionFactor(row.decision_score_id);

  const edit = (patch: Partial<DecisionFactorRow>) => {
    setDraft((d: DecisionFactorRow) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        id: row.id,
        patch: {
          title: draft.title,
          description: draft.description,
          factor_type: draft.factor_type,
          impact: draft.impact,
        }
      });
      setDirty(false);
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <TextField 
              label="Factor / Strength" 
              value={draft.title} 
              onChange={(v) => edit({ title: v })} 
            />
          </div>
          <div className="flex items-center gap-1 mt-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={async () => {
                if(confirm("Remove this strength?")) {
                  await remove.mutateAsync(row.id);
                  toast.success("Removed");
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Type">
            <Select 
              value={draft.factor_type} 
              onValueChange={(v) => edit({ factor_type: v as any })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FACTOR_TYPES.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          
          <div className="md:col-span-2">
            <TextField 
              label="Description (Optional)" 
              value={draft.description ?? ""} 
              onChange={(v) => edit({ description: v })} 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" disabled={!dirty || update.isPending} onClick={handleSave}>
            {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
