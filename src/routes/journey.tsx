import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Building2,
  Home,
  Trash2,
  ExternalLink,
  Loader2,
  Inbox,
  Bookmark,
  Target,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJourney } from "@/hooks/useJourney";
import { useQuery } from "@tanstack/react-query";
import { ProjectPublicService } from "@/lib/services/projects-public";
import { BuilderPublicService } from "@/lib/services/builders-public";
import { getPlaceById } from "@/lib/services/places";
import { Badge } from "@/components/ui/badge";
import { type JourneyItem, type JourneyEntityType } from "@/lib/services/journey";
import { DecisionCriteriaManager } from "@/components/journey/DecisionCriteriaManager";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My Journey — NestHunt" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Track your property decision journey — shortlist and evaluate projects.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { items, isLoading, remove } = useJourney();

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader
          eyebrow="Workspace"
          title="My Journey"
          description="Your personal space for evaluating property decisions."
        />
        <Container>
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading your journey...</p>
          </div>
        </Container>
      </AppLayout>
    );
  }

  const projects = items.filter((i) => i.type === "project");
  const builders = items.filter((i) => i.type === "builder");
  const places = items.filter((i) => i.type === "place");

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Workspace"
        title="My Journey"
        description="A private space to shortlist and refine your property decisions over time."
      />
      <Container className="pb-20">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Bookmark className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Your NestHunt Journey is empty
            </h2>
            <p className="max-w-md text-muted-foreground mb-8">
              Save Projects, Builders or Places you're considering and we'll keep them together for your decision journey.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link to="/projects/$slug" params={{ slug: "hero-homes" }}>View Projects</Link>
              </Button>
              <Button asChild>
                <Link to="/">Explore Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* BUILD-032 Decision Criteria Foundation */}
            <DecisionCriteriaManager />

            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold text-foreground">Shortlist</h2>
              <div className="grid gap-8 lg:grid-cols-2">
                <JourneySection
                  title="Saved places"
                  icon={<MapPin className="h-4 w-4" />}
                  items={places}
                  remove={remove}
                />
                <JourneySection
                  title="Saved builders"
                  icon={<Building2 className="h-4 w-4" />}
                  items={builders}
                  remove={remove}
                />
                <JourneySection
                  title="Saved projects"
                  icon={<Home className="h-4 w-4" />}
                  items={projects}
                  remove={remove}
                />
                
                <Card className="rounded-xl border-border border-dashed bg-muted/30 shadow-none">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Inbox className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Decision Intelligence
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground max-w-[200px]">
                      Comparison tools and personalized metrics will appear here in future updates.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}

function JourneySection({
  title,
  icon,
  items,
  remove,
}: {
  title: string;
  icon: React.ReactNode;
  items: JourneyItem[];
  remove: (type: JourneyEntityType, id: string) => void;
}) {
  return (
    <Card className="rounded-xl border-border bg-surface shadow-none h-fit">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </span>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title} ({items.length})
          </h2>
        </div>
        
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-lg border border-border border-dashed">
            No {title.toLowerCase()} saved yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <JourneyItemRow 
                key={`${item.type}-${item.id}`} 
                item={item} 
                onRemove={() => remove(item.type, item.id)} 
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function JourneyItemRow({ 
  item, 
  onRemove 
}: { 
  item: JourneyItem; 
  onRemove: () => void 
}) {
  const { data: entity, isLoading, isError } = useQuery({
    queryKey: ["journey", "entity", item.type, item.id],
    queryFn: async () => {
      if (item.type === "project") {
        const res = await ProjectPublicService.getProjectById(item.id);
        return res ? { name: res.project.name, slug: res.project.slug, type: "project" } : null;
      }
      if (item.type === "builder") {
        const res = await BuilderPublicService.getBuilderById(item.id);
        return res ? { name: res.builder.name, slug: res.builder.slug, type: "builder" } : null;
      }
      if (item.type === "place") {
        const res = await getPlaceById(item.id);
        return res ? { name: res.name, slug: res.slug, type: "place" } : null;
      }
      return null;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <li className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/5 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded" />
      </li>
    );
  }

  if (isError || !entity) {
    return (
      <li className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-destructive">Currently unavailable</span>
          <span className="text-[10px] text-muted-foreground uppercase">Reference ID: {item.id.slice(0, 8)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </li>
    );
  }

  const getHref = () => {
    if (entity.type === "project") return { to: "/projects/$slug" as const, params: { slug: entity.slug } };
    if (entity.type === "builder") return { to: "/builders/$slug" as const, params: { slug: entity.slug } };
    if (entity.type === "place") return { to: "/places/new-chandigarh" as const };
    return { to: "/" as const };
  };

  return (
    <li className="group flex items-center justify-between p-3 rounded-lg border border-border bg-muted/5 hover:border-accent/40 hover:bg-muted/10 transition-all">
      <Link 
        {...(getHref() as any)}
        className="flex-1 min-w-0 flex flex-col"
      >
        <span className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
          {entity.name}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Saved {new Date(item.savedAt).toLocaleDateString()}
        </span>
      </Link>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Link {...(getHref() as any)}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
