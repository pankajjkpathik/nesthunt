import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ShieldCheck, ExternalLink, FileText } from "lucide-react";
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
import { MediaPicker } from "@/components/admin/media/MediaPicker";
import {
  useBuilderEvidence,
  useCreateEvidence,
  useDeleteEvidence,
  useUpdateEvidence,
  useVerifyEvidence,
} from "@/hooks/usePlaceIntelligence";
import {
  CONFIDENCE_LEVELS,
  EVIDENCE_CATEGORIES,
  EVIDENCE_TYPES,
  VERIFICATION_STATUSES,
  type PlaceEvidenceRow,
} from "@/lib/services/place-intelligence";

interface Props {
  builderId?: string;
}

export function EvidenceTab({ builderId }: Props) {
  const { data = [], isLoading } = useBuilderEvidence(builderId);
  const create = useCreateEvidence();
  const [creating, setCreating] = useState(false);

  if (!builderId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Save the builder first to attach research evidence.
        </CardContent>
      </Card>
    );
  }

  async function addEmpty() {
    if (!builderId) return;
    setCreating(true);
    try {
      await create.mutateAsync({ builder_id: builderId, title: "New evidence" } as any);
      toast.success("Evidence added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Evidence Records</h3>
          <p className="text-xs text-muted-foreground">
            Sources, citations, documents and photos that back this builder's intelligence.
          </p>
        </div>
        <Button size="sm" onClick={addEmpty} disabled={creating}>
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add evidence
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading evidence…
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No evidence records yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((row: PlaceEvidenceRow) => (
            <EvidenceRow key={row.id} row={row} builderId={builderId} />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceRow({ row, builderId }: { row: PlaceEvidenceRow; builderId: string }) {
  const [draft, setDraft] = useState<PlaceEvidenceRow>(row);
  const [dirty, setDirty] = useState(false);
  const update = useUpdateEvidence();
  const verify = useVerifyEvidence();
  const remove = useDeleteEvidence(builderId, "builder");
  const [pickerOpen, setPickerOpen] = useState(false);

  function edit<K extends keyof PlaceEvidenceRow>(key: K, value: PlaceEvidenceRow[K]) {
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
          description: draft.description,
          source_name: draft.source_name,
          source_url: draft.source_url,
          publication_date: draft.publication_date,
          evidence_type: draft.evidence_type,
          confidence_level: draft.confidence_level,
          verification_status: draft.verification_status,
          uploaded_document_media_id: draft.uploaded_document_media_id,
          review_date: draft.review_date,
        },
      });
      setDirty(false);
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">
              {draft.evidence_type.replace(/_/g, " ")}
            </Badge>
            <StatusBadge status={draft.verification_status} />
            <Badge variant="secondary" className="text-[10px] uppercase">
              {draft.confidence_level} confidence
            </Badge>
          </div>
          <div className="flex gap-2">
            {draft.verification_status !== "verified" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await verify.mutateAsync(row.id);
                    toast.success("Verified");
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
              >
                <ShieldCheck className="mr-1 h-3 w-3" /> Verify
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (!confirm("Delete this evidence record?")) return;
                await remove.mutateAsync(row.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <TextField label="Title" value={draft.title} onChange={(v) => edit("title", v)} />
        <Field label="Category">
          <Select value={draft.category} onValueChange={(v) => edit("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVIDENCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Type">
          <Select value={draft.evidence_type} onValueChange={(v) => edit("evidence_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVIDENCE_TYPES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Confidence level">
          <Select value={draft.confidence_level} onValueChange={(v) => edit("confidence_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONFIDENCE_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <TextField label="Source name" value={draft.source_name ?? ""} onChange={(v) => edit("source_name", v)} />
        <TextField
          label="Source URL"
          value={draft.source_url ?? ""}
          onChange={(v) => edit("source_url", v)}
        />

        <Field label="Publication date">
          <input
            type="date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={draft.publication_date ?? ""}
            onChange={(e) => edit("publication_date", e.target.value || null)}
          />
        </Field>
        <Field label="Verification status">
          <Select value={draft.verification_status} onValueChange={(v) => edit("verification_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VERIFICATION_STATUSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <div className="md:col-span-2">
          <TextareaField
            label="Description / notes"
            rows={3}
            value={draft.description ?? ""}
            onChange={(v) => edit("description", v)}
          />
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <FileText className="mr-2 h-3 w-3" />
            {draft.uploaded_document_media_id ? "Change document" : "Attach document"}
          </Button>
          {draft.uploaded_document_media_id ? (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => edit("uploaded_document_media_id", null)}
            >
              Remove attachment
            </button>
          ) : null}
          {draft.source_url ? (
            <a
              className="ml-auto inline-flex items-center gap-1 text-xs text-accent hover:underline"
              href={draft.source_url}
              target="_blank"
              rel="noreferrer"
            >
              Open source <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button size="sm" disabled={!dirty || update.isPending} onClick={save}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </CardContent>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(assets) => {
          if (assets[0]) edit("uploaded_document_media_id", assets[0].id);
          setPickerOpen(false);
        }}
        multiple={false}
      />
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    rejected: "bg-destructive/10 text-destructive",
    unverified: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[status] ?? map.unverified}`}>
      {status}
    </span>
  );
}
