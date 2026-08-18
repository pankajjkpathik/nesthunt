import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

import { ProjectRow } from "@/lib/services/projects-admin";

interface ProjectDueDiligenceProps {
  project?: ProjectRow;
}

export function ProjectDueDiligence({ project }: ProjectDueDiligenceProps) {
  const latestProgress = project?.progress && project.progress.length > 0 
    ? project.progress[project.progress.length - 1] 
    : null;
    
  const progressDate = latestProgress?.split('as of')[1]?.split(')')[0]?.trim() || "the latest official update";

  const checklist = [
    "Verify the current RERA registration and latest quarterly update on the official authority website.",
    `Request a current construction update because the latest official progress available to NestHunt is dated ${progressDate}.`,
    "Verify the contractual possession date against the allotment/agreement documents and penalty clauses.",
    "Obtain a current unit-specific cost sheet including applicable additional charges (PLC, parking, taxes).",
    "Confirm maintenance charges and what specific facilities are covered in the agreement.",
    "Review all project approvals including Land Use (LU), environment, and fire safety.",
    "Inspect the actual site and surrounding infrastructure to verify access and quality.",
    "Verify that promised amenities are part of the legally binding builder-buyer agreement."
  ];

  return (
    <section id="due-diligence" aria-labelledby="due-diligence-heading">
      <Card className="border-border bg-muted/30 shadow-none border-dashed">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckSquare className="h-6 w-6 text-accent" />
            <h2 id="due-diligence-heading" className="font-display text-2xl font-bold text-foreground">
              Buyer Due-Diligence Checklist
            </h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            This checklist provides general guidance for property buyers. 
            Verification of these items is the responsibility of the buyer. 
            NestHunt does not provide legal advice.
          </p>

          <ul className="grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {checklist.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                <span className="flex-none font-mono text-[10px] font-bold text-accent mt-0.5">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
