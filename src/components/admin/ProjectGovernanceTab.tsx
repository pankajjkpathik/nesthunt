import { useProjectGovernance, useProjectExceptions, useUpdateGovernance, useCreateException, useUpdateException } from "@/hooks/useProjectGovernance";
import { ProjectGovernanceService, type IntakeStatus, type VerificationLevel, type ExceptionType, type ExceptionStatus, type ProjectGovernanceRow, type ProjectExceptionRow } from "@/lib/services/project-governance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { useState } from "react";

const EXCEPTION_TYPES: { value: ExceptionType; label: string }[] = [
  { value: "RERA_CONFLICT", label: "RERA Conflict" },
  { value: "IDENTITY_CONFLICT", label: "Identity Conflict" },
  { value: "BUILDER_CONFLICT", label: "Builder Conflict" },
  { value: "PLACE_CONFLICT", label: "Place Conflict" },
  { value: "POSSESSION_CONFLICT", label: "Possession Conflict" },
  { value: "PROGRESS_OUTDATED", label: "Progress Outdated" },
  { value: "MISSING_RERA", label: "Missing RERA" },
  { value: "MISSING_EVIDENCE", label: "Missing Evidence" },
  { value: "REGULATORY_REFERENCE", label: "Regulatory Reference" },
  { value: "PRICE_UNAVAILABLE", label: "Price Unavailable" },
];

export function ProjectGovernanceTab({ project }: { project: { id: string; name?: string | null; slug?: string | null; builder_id?: string | null; place_id?: string | null; rera_number?: string | null } }) {
  const { data: gov, isLoading: loadingGov } = useProjectGovernance(project.id);
  const { data: exceptions = [], isLoading: loadingExceptions } = useProjectExceptions(project.id);
  const updateGov = useUpdateGovernance();
  const createEx = useCreateException();
  const updateEx = useUpdateException();

  const [newEx, setNewEx] = useState<{ type: ExceptionType; note: string }>({
    type: "IDENTITY_CONFLICT",
    note: "",
  });

  if (loadingGov || loadingExceptions) return <div className="p-8 text-center text-sm text-muted-foreground">Loading governance data...</div>;

  const readiness = ProjectGovernanceService.calculateReadiness(project, gov || null, exceptions);

  const handleAddException = () => {
    if (!newEx.note.trim()) return;
    createEx.mutate({
      project_id: project.id,
      type: newEx.type,
      note: newEx.note,
      status: "OPEN",
    });
    setNewEx({ type: "IDENTITY_CONFLICT", note: "" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Intake & Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Intake Status</Label>
              <Select
                value={gov?.intake_status || "DRAFT"}
                onValueChange={(v) => gov && updateGov.mutate({ id: gov.id, patch: { intake_status: v as IntakeStatus }, projectId: project.id })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="DATA_REVIEW">Data Review</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Verification Level</Label>
              <Select
                value={gov?.verification_level || "STANDARD"}
                onValueChange={(v) => gov && updateGov.mutate({ id: gov.id, patch: { verification_level: v as VerificationLevel }, projectId: project.id })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="ENHANCED">Enhanced</SelectItem>
                  <SelectItem value="DEEP_REVIEW">Deep Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Publication Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              {readiness.isReady ? (
                <Badge className="bg-success/10 text-success hover:bg-success/20">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Ready to Publish
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3.5 w-3.5" /> Publication Blocked
                </Badge>
              )}
            </div>
            <div className="space-y-2.5">
              {readiness.checks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                  ) : check.critical ? (
                    <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  ) : (
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className={check.passed ? "text-foreground" : check.critical ? "font-medium text-destructive" : "text-muted-foreground"}>
                      {check.label}
                    </div>
                    {check.reason && !check.passed && (
                      <div className="text-xs text-muted-foreground">{check.reason}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Exception Governance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Log New Exception</div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newEx.type}
                  onValueChange={(v) => setNewEx({ ...newEx, type: v as ExceptionType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXCEPTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Factual Note</Label>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Describe the conflict or discovery..." 
                    className="h-10 min-h-[40px]" 
                    value={newEx.note}
                    onChange={(e) => setNewEx({ ...newEx, note: e.target.value })}
                  />
                  <Button onClick={handleAddException}>Flag</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {exceptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No active governance flags.</div>
            ) : (
              exceptions.map((ex) => (
                <div key={ex.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={ex.status === "OPEN" ? "destructive" : "outline"}>
                        {EXCEPTION_TYPES.find(t => t.value === ex.type)?.label || ex.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Logged {new Date(ex.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {ex.status === "OPEN" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateEx.mutate({ id: ex.id, patch: { status: "RESOLVED" } })}>
                            Resolve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => updateEx.mutate({ id: ex.id, patch: { status: "WAIVED" } })}>
                            Waive
                          </Button>
                        </>
                      )}
                      {ex.status !== "OPEN" && (
                        <Badge className="bg-success/10 text-success">
                          {ex.status} {ex.resolved_at && `on ${new Date(ex.resolved_at).toLocaleDateString()}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{ex.note}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
