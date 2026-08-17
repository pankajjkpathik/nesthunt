import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  MapPin, 
  Car, 
  GraduationCap, 
  Hospital, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";

interface NearbyInfrastructureProps {
  nearby: any;
}

export function ProjectNearbyInfrastructure({ nearby }: NearbyInfrastructureProps) {
  if (!nearby || (Array.isArray(nearby) && nearby.length === 0)) return null;

  // Assuming nearby is an array of NearbyEntry from projects-admin.ts
  const entries = Array.isArray(nearby) ? nearby : [];
  
  if (entries.length === 0) return null;

  // Group by category
  const grouped = entries.reduce((acc: any, curr: any) => {
    const cat = curr.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const categoryIcons: Record<string, any> = {
    'Education': <GraduationCap className="h-4 w-4" />,
    'Healthcare': <Hospital className="h-4 w-4" />,
    'Shopping': <ShoppingBag className="h-4 w-4" />,
    'Transport': <Car className="h-4 w-4" />,
    'Retail': <ShoppingBag className="h-4 w-4" />,
    'Employment': <Building2 className="h-4 w-4" />
  };

  return (
    <section id="infrastructure" aria-labelledby="infra-heading">
      <h2 id="infra-heading" className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
        Nearby Infrastructure
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([category, items]: [string, any]) => (
          <Card key={category} className="border-border bg-surface shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4 text-accent">
                {categoryIcons[category] || <MapPin className="h-4 w-4" />}
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  {category}
                </h3>
              </div>
              <ul className="space-y-4">
                {items.map((item: any, idx: number) => (
                  <li key={idx} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-foreground leading-tight">{item.name}</span>
                      {item.distance && (
                        <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                          {item.distance}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
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
