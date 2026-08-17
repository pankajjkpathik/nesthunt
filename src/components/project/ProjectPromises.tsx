import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from "lucide-react";
import type { PromiseLedgerRow } from "@/lib/services/decision-intelligence";
import { cn } from "@/lib/utils";

interface ProjectPromisesProps {
  promises: PromiseLedgerRow[];
}

export function ProjectPromises({ promises }: ProjectPromisesProps) {
  if (promises.length === 0) return null;

  return (
    <section id="promises" aria-labelledby="promises-heading">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-success" />
        <h2 id="promises-heading" className="font-display text-2xl font-bold text-foreground">
          Commitment Tracker
        </h2>
      </div>
      
      <div className="grid gap-4">
        {promises.map((p) => (
          <Card key={p.id} className="border-border bg-surface shadow-none overflow-hidden group">
            <div className={cn(
              "h-1 w-full",
              p.status === 'completed' || p.status === 'delivered' ? 'bg-success' : 
              p.status === 'progress' || p.status === 'ongoing' ? 'bg-warning' :
              p.status === 'delayed' ? 'bg-destructive' : 'bg-muted'
            )} />
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-semibold text-foreground text-lg">{p.promise}</h4>
                    {p.last_verified && (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-[10px] py-0">
                        NestHunt Verified
                      </Badge>
                    )}
                  </div>
                  {p.remarks && <p className="text-sm text-muted-foreground leading-relaxed">{p.remarks}</p>}
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                    {p.announcement_date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Announced: {new Date(p.announcement_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>

                <Badge className={cn(
                  "font-mono text-[10px] uppercase tracking-wider px-3",
                  p.status === 'completed' || p.status === 'delivered' ? 'bg-success/10 text-success border-success/20' : 
                  p.status === 'progress' || p.status === 'ongoing' ? 'bg-warning/10 text-warning border-warning/20' :
                  p.status === 'delayed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  'bg-muted text-muted-foreground border-none'
                )}>
                  {p.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
