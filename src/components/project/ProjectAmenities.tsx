import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ProjectAmenitiesProps {
  amenities: any;
}

export function ProjectAmenities({ amenities }: ProjectAmenitiesProps) {
  if (!amenities) return null;
  
  const amenityArray = Array.isArray(amenities) ? (amenities as string[]) : [];
  if (amenityArray.length === 0) return null;

  // Group by category if format is "Category:Amenity"
  const grouped = amenityArray.reduce((acc, curr) => {
    if (typeof curr !== 'string') return acc;
    const [cat, name] = curr.includes(':') ? curr.split(':') : ['Other', curr];
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <section id="amenities" aria-labelledby="amenities-heading">
      <h2 id="amenities-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
        Lifestyle & Amenities
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category} className="border-border bg-surface shadow-none">
            <CardContent className="p-5">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {(items as string[]).map((item: string) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
