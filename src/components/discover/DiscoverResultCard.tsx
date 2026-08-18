import { Link } from "@tanstack/react-router";
import { Building2, MapPin, Landmark, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaveToJourneyButton } from "@/components/journey/SaveToJourneyButton";
import type { DiscoveryResult } from "@/lib/services/discovery";

function formatPrice(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function Shell({
  children,
  title,
  icon,
  meta,
  action,
  image,
}: {
  children?: React.ReactNode;
  title: React.ReactNode;
  icon: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  image?: string | null;
}) {
  return (
    <Card className="h-full overflow-hidden transition-colors hover:border-accent/50">
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : null}
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              {icon}
              {meta}
            </div>
            <h3 className="mt-1 truncate font-display text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function DiscoverResultCard({ item }: { item: DiscoveryResult }) {
  if (item.kind === "project") {
    return (
      <Shell
        image={item.imageUrl}
        icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
        meta={<span className="text-xs uppercase tracking-wider">Project</span>}
        action={
          <SaveToJourneyButton
            type="project"
            id={item.id}
            name={item.name}
            size="icon"
            variant="ghost"
            showLabel={false}
          />
        }
        title={
          <Link
            to="/projects/$slug"
            params={{ slug: item.slug }}
            className="rounded-sm outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.name}
          </Link>
        }
      >
        <dl className="space-y-1 text-sm text-muted-foreground">
          {item.locality ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.locality}</span>
            </div>
          ) : null}
          {item.builderName ? <div>By {item.builderName}</div> : null}
          {item.configuration ? <div>{item.configuration}</div> : null}
          {item.startingPrice !== null ? (
            <div className="text-foreground">From {formatPrice(item.startingPrice)}</div>
          ) : null}
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {item.constructionStatus || item.status ? (
            <Badge variant="secondary">{item.constructionStatus ?? item.status}</Badge>
          ) : null}
          {item.reraNumber ? (
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> RERA {item.reraNumber}
            </Badge>
          ) : null}
        </div>
      </Shell>
    );
  }

  if (item.kind === "builder") {
    return (
      <Shell
        image={item.logoUrl}
        icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
        meta={<span className="text-xs uppercase tracking-wider">Builder</span>}
        action={
          <SaveToJourneyButton
            type="builder"
            id={item.id}
            name={item.name}
            size="icon"
            variant="ghost"
            showLabel={false}
          />
        }
        title={
          <Link
            to="/builders/$slug"
            params={{ slug: item.slug }}
            className="rounded-sm outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.name}
          </Link>
        }
      >
        <dl className="space-y-1 text-sm text-muted-foreground">
          {item.headquarters || item.city ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{item.headquarters ?? item.city}</span>
            </div>
          ) : null}
          {item.yearEstablished ? <div>Established {item.yearEstablished}</div> : null}
        </dl>
      </Shell>
    );
  }

  const placeHasRoute = item.slug === "new-chandigarh";
  return (
    <Shell
      icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
      meta={<span className="text-xs uppercase tracking-wider">Place</span>}
      action={
        <SaveToJourneyButton
          type="place"
          id={item.id}
          name={item.name}
          size="icon"
          variant="ghost"
          showLabel={false}
        />
      }
      title={
        placeHasRoute ? (
          <Link
            to="/places/new-chandigarh"
            className="rounded-sm outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.name}
          </Link>
        ) : (
          item.name
        )
      }
    >
      <p className="text-sm text-muted-foreground">
        {[item.city, item.state, item.region].filter(Boolean).join(" · ")}
      </p>
      {!placeHasRoute ? (
        <p className="text-xs text-muted-foreground">Detailed report not yet published</p>
      ) : null}
    </Shell>
  );
}
