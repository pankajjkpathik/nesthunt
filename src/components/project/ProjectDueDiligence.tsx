import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export function ProjectDueDiligence() {
  const checklist = [
    "Verify current RERA registration status on the official authority website.",
    "Verify possession timeline and construction progress milestones.",
    "Review all agreement terms, including penalty clauses and maintenance terms.",
    "Verify unit-specific pricing, including additional charges (PLC, parking, taxes).",
    "Confirm maintenance charges and what facilities are included.",
    "Review project approvals (LU, environment, fire safety, height clearance).",
    "Inspect the actual site and surrounding infrastructure.",
    "Verify that promised amenities are part of the legally binding agreement."
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
