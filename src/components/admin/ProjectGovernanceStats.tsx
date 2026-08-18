import { useAdminGovernanceStats } from "@/hooks/useProjectGovernance";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, FileSearch, ShieldCheck } from "lucide-react";

export function ProjectGovernanceStats() {
  const { data: stats, isLoading } = useAdminGovernanceStats();

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Projects</span>
          <span className="text-2xl font-bold">{stats.total}</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ready for QA</span>
            <FileSearch className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold">{stats.readyForQA}</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deep Review</span>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <span className="text-2xl font-bold">{stats.deepReview}</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Verified Intake</span>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <span className="text-2xl font-bold">{stats.verified}</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Published</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <span className="text-2xl font-bold">{stats.published}</span>
        </CardContent>
      </Card>
    </div>
  );
}
