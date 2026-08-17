import { ReactNode } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  ArrowRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectEntityRelationshipsProps {
  project: {
    builder?: { name: string; slug: string };
    place?: { name: string; slug: string };
  };
}

export function ProjectEntityRelationships({ project }: ProjectEntityRelationshipsProps) {
  if (!project.builder && !project.place) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {project.builder && (
        <RelationshipCard 
          title="Developed by"
          name={project.builder.name}
          slug={project.builder.slug}
          type="builder"
          icon={<ShieldCheck className="h-5 w-5 text-accent" />}
          description="View verified builder track record, delivery history, and trust score."
        />
      )}
      {project.place && (
        <RelationshipCard 
          title="Located in"
          name={project.place.name}
          slug={project.place.slug}
          type="place"
          icon={<MapPin className="h-5 w-5 text-accent" />}
          description="Explore location intelligence, infrastructure timeline, and locality risks."
        />
      )}
    </div>
  );
}

function RelationshipCard({ title, name, slug, type, icon, description }: { 
  title: string, 
  name: string, 
  slug: string, 
  type: 'builder' | 'place',
  icon: ReactNode,
  description: string
}) {
  return (
    <Card className="border-border bg-surface shadow-none hover:border-accent/40 transition-colors group">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
            <h4 className="font-display font-bold text-foreground text-lg group-hover:text-accent transition-colors">
              {name}
            </h4>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        <Button variant="outline" className="w-full group/btn" asChild>
          {type === 'builder' ? (
            <Link to="/builders/$slug" params={{ slug } as any}>
              Explore Builder
              <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link to="/places/$slug" params={{ slug } as any}>
              Explore Locality
              <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
