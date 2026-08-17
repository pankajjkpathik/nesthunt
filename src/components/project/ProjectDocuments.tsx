import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Download
} from "lucide-react";
import type { ProjectRow } from "@/lib/services/projects-admin";
import { Button } from "@/components/ui/button";

interface ProjectDocumentsProps {
  project: ProjectRow;
}

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
  const rera = (project.rera || {}) as any;
  const hero = (project.hero || {}) as any;
  
  const docs = [
    { 
      name: "RERA Certificate", 
      url: rera.certificateUrl, 
      type: "Official Approval" 
    },
    { 
      name: "Project Brochure", 
      url: hero.brochureUrl, 
      type: "Marketing" 
    },
    { 
      name: "Master Plan", 
      url: hero.masterPlanUrl, 
      type: "Layout" 
    }
  ].filter(d => d.url);

  if (docs.length === 0) return null;

  return (
    <section id="documents" aria-labelledby="documents-heading">
      <h2 id="documents-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
        Project Documents
      </h2>
      <div className="grid gap-4">
        {docs.map((doc) => (
          <Card key={doc.name} className="border-border bg-surface shadow-none hover:border-accent/40 transition-colors group">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{doc.name}</h4>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{doc.type}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0" asChild>
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
