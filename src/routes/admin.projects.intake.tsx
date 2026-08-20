import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Save,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAdminBuilders } from "@/hooks/useAdminBuilders";
import { useAdminPlaces } from "@/hooks/useAdmin";
import { useServerFn } from "@tanstack/react-start";
import { validateIntakeBatch, executeIntakeBatch } from "@/lib/project-intake.functions";
import { slugify } from "@/lib/services/projects-admin";

export const Route = createFileRoute("/admin/projects/intake")({
  component: ProjectIntakePage,
});

interface IntakeRow {
  id: string;
  name: string;
  slug: string;
  builder_slug: string;
  place_slug: string;
  rera_number: string;
  property_type: string;
  starting_price: string;
  possession_date: string;
  executive_summary: string;
  isExpanded: boolean;
  validation?: {
    status: 'READY' | 'DUPLICATE' | 'NEEDS_REVIEW' | 'INVALID' | 'PENDING';
    reason?: string;
    projectId?: string;
  };
  result?: {
    status: 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'NEEDS_REVIEW' | 'FAILED';
    projectId?: string;
    reason?: string;
  };
}

function ProjectIntakePage() {
  const navigate = useNavigate();
  const { data: builders = [] } = useAdminBuilders();
  const { data: places = [] } = useAdminPlaces();
  const validateFn = useServerFn(validateIntakeBatch);
  const executeFn = useServerFn(executeIntakeBatch);

  const [rows, setRows] = useState<IntakeRow[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      slug: "",
      builder_slug: "",
      place_slug: "",
      rera_number: "",
      property_type: "Apartment",
      starting_price: "",
      possession_date: "",
      executive_summary: "",
      isExpanded: false,
      validation: { status: 'PENDING' }
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    submitted: number;
    created: number;
    skipped: number;
    failed: number;
  } | null>(null);

  const addRow = () => {
    setRows([...rows, {
      id: crypto.randomUUID(),
      name: "",
      slug: "",
      builder_slug: "",
      place_slug: "",
      rera_number: "",
      property_type: "Apartment",
      starting_price: "",
      possession_date: "",
      executive_summary: "",
      isExpanded: false,
      validation: { status: 'PENDING' }
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const duplicateRow = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (row) {
      setRows([...rows, { ...row, id: crypto.randomUUID(), validation: { status: 'PENDING' }, result: undefined }]);
    }
  };

  const updateRow = (id: string, patch: Partial<IntakeRow>) => {
    setRows(rows.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...patch, validation: { status: 'PENDING' as const } };
        // Auto-slugify if name changes and slug is empty or matches previous slugified name
        if (patch.name !== undefined && (!r.slug || r.slug === slugify(r.name))) {
          updated.slug = slugify(patch.name);
        }
        return updated;
      }
      return r;
    }));
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      const payload = rows.map(r => ({
        name: r.name,
        slug: r.slug,
        builder_slug: r.builder_slug,
        place_slug: r.place_slug,
        rera_number: r.rera_number || null,
        property_type: r.property_type || null,
        starting_price: r.starting_price ? parseFloat(r.starting_price) : null,
        possession_date: r.possession_date || null,
        executive_summary: r.executive_summary || null,
      }));

      const results = await validateFn({ data: payload });
      setRows(rows.map((r, i) => ({
        ...r,
        validation: results[i] as any
      })));
      toast.success("Validation complete");
    } catch (error: any) {
      toast.error("Validation failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      const payload = rows.map(r => ({
        name: r.name,
        slug: r.slug,
        builder_slug: r.builder_slug,
        place_slug: r.place_slug,
        rera_number: r.rera_number || null,
        property_type: r.property_type || null,
        starting_price: r.starting_price ? parseFloat(r.starting_price) : null,
        possession_date: r.possession_date || null,
        executive_summary: r.executive_summary || null,
      }));

      const results = await executeFn({ data: payload });
      
      const newRows = rows.map((r, i) => ({
        ...r,
        result: results[i] as any
      }));
      setRows(newRows);

      const summary = {
        submitted: results.length,
        created: results.filter(r => r.status === 'CREATED').length,
        skipped: results.filter(r => r.status === 'SKIPPED_DUPLICATE').length,
        failed: results.filter(r => r.status === 'FAILED' || r.status === 'NEEDS_REVIEW').length,
      };
      setBatchResult(summary);
      toast.success(`Batch complete: ${summary.created} created`);
    } catch (error: any) {
      toast.error("Execution failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isAllReady = rows.every(r => r.validation?.status === 'READY');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/projects" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Project Intake</h1>
            <p className="text-sm text-muted-foreground">Bulk onboard property records into the draft pipeline.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={isProcessing}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Validate Batch
          </Button>
          <Button onClick={handleExecute} disabled={isProcessing || !isAllReady}>
            <Play className="mr-2 h-4 w-4" /> Create Draft Projects
          </Button>
        </div>
      </div>

      {batchResult && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-background border">
                <div className="text-2xl font-bold">{batchResult.submitted}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Submitted</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{batchResult.created}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Created</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{batchResult.skipped}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Skipped</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{batchResult.failed}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Failed/Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rows.map((row, index) => (
          <Card key={row.id} className={row.result?.status === 'CREATED' ? 'border-green-500/50' : ''}>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-muted/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => updateRow(row.id, { isExpanded: !row.isExpanded })}
                >
                  {row.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div className="flex flex-col min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {row.name || "Untitled Project"}
                    {row.validation?.status && (
                      <Badge variant={
                        row.validation.status === 'READY' ? 'default' : 
                        row.validation.status === 'DUPLICATE' ? 'destructive' : 
                        'secondary'
                      } className="text-[10px] h-4">
                        {row.validation.status}
                      </Badge>
                    )}
                    {row.result?.status && (
                      <Badge variant={row.result.status === 'CREATED' ? 'default' : 'secondary'} className="bg-green-600 text-white text-[10px] h-4">
                        {row.result.status}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {row.slug || "no-slug"} • {row.builder_slug || "no-builder"} • {row.place_slug || "no-place"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {row.result?.projectId && (
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link to="/admin/projects/$id" params={{ id: row.result.projectId }}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> CMS
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateRow(row.id)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(row.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Project Name *</label>
                  <Input 
                    value={row.name} 
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    placeholder="e.g. Hero Homes"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slug *</label>
                  <Input 
                    value={row.slug} 
                    onChange={(e) => updateRow(row.id, { slug: e.target.value })}
                    placeholder="e.g. hero-homes"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Builder *</label>
                  <Select 
                    value={row.builder_slug} 
                    onValueChange={(v) => updateRow(row.id, { builder_slug: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select builder" />
                    </SelectTrigger>
                    <SelectContent>
                      {builders.map(b => (
                        <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Place *</label>
                  <Select 
                    value={row.place_slug} 
                    onValueChange={(v) => updateRow(row.id, { place_slug: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select place" />
                    </SelectTrigger>
                    <SelectContent>
                      {places.map(p => (
                        <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {row.isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-dashed">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">RERA Number</label>
                      <Input 
                        value={row.rera_number} 
                        onChange={(e) => updateRow(row.id, { rera_number: e.target.value })}
                        placeholder="RERA Number"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Starting Price (INR)</label>
                      <Input 
                        type="number"
                        value={row.starting_price} 
                        onChange={(e) => updateRow(row.id, { starting_price: e.target.value })}
                        placeholder="e.g. 7500000"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Property Type</label>
                      <Input 
                        value={row.property_type} 
                        onChange={(e) => updateRow(row.id, { property_type: e.target.value })}
                        placeholder="Apartment, Villa, etc."
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Possession Date</label>
                      <Input 
                        type="date"
                        value={row.possession_date} 
                        onChange={(e) => updateRow(row.id, { possession_date: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Executive Summary</label>
                    <Textarea 
                      value={row.executive_summary} 
                      onChange={(e) => updateRow(row.id, { executive_summary: e.target.value })}
                      placeholder="Brief overview of the project..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {row.validation?.reason && (
                <div className={`mt-3 p-2 rounded text-xs flex items-start gap-2 ${
                  row.validation.status === 'READY' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                  row.validation.status === 'DUPLICATE' ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' :
                  'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400'
                }`}>
                  {row.validation.status === 'READY' ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                  <span>{row.validation.reason}</span>
                </div>
              )}

              {row.result?.reason && (
                <div className="mt-3 p-2 rounded text-xs flex items-start gap-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{row.result.reason}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" size="sm" onClick={addRow} className="rounded-full px-8 h-10 border-dashed">
          <Plus className="mr-2 h-4 w-4" /> Add Project Row
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t z-50 flex justify-center">
        <div className="max-w-[1400px] w-full flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {rows.length} record(s) in batch • {rows.filter(r => r.validation?.status === 'READY').length} ready
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleValidate} disabled={isProcessing}>
              Validate Batch
            </Button>
            <Button onClick={handleExecute} disabled={isProcessing || !isAllReady} className="bg-primary hover:bg-primary/90">
              {isProcessing ? "Processing..." : "Create Draft Projects"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
