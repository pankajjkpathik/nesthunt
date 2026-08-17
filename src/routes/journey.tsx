import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  MapPin,
  Building2,
  Home,
  GitCompare,
  StickyNote,
  HelpCircle,
  CalendarDays,
} from "lucide-react";
import type { ReactNode } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My Journey — NestHunt" },
      {
        name: "description",
        content:
          "Track your property decision journey — shortlist, compare, and revisit your reasoning at every step.",
      },
      { property: "og:title", content: "My Journey — NestHunt" },
      {
        property: "og:description",
        content:
          "Your personal workspace for evaluating places, builders, and projects.",
      },
    ],
  }),
  component: JourneyPage,
});

interface JourneyItem {
  primary: string;
  secondary?: string;
  href?: { to: string };
  meta?: string;
}

const RECENTLY_VIEWED: JourneyItem[] = [
  { primary: "New Chandigarh", secondary: "Place · viewed 2h ago", href: { to: "/places/new-chandigarh" } },
  { primary: "Hero Homes", secondary: "Project · viewed yesterday", href: { to: "/projects/$slug" as const, params: { slug: "hero-homes" } } },
  { primary: "Omaxe", secondary: "Builder · viewed 3 days ago", href: { to: "/builder/omaxe" } },
];

const SAVED_PLACES: JourneyItem[] = [
  { primary: "New Chandigarh", secondary: "Punjab", meta: "Score 8.9", href: { to: "/places/new-chandigarh" } },
  { primary: "Zirakpur", secondary: "Punjab", meta: "Score 7.6" },
];

const SAVED_BUILDERS: JourneyItem[] = [
  { primary: "Omaxe", secondary: "132 delivered", meta: "Trust 87", href: { to: "/builder/omaxe" } },
  { primary: "DLF", secondary: "220 delivered", meta: "Trust 91" },
];

const SAVED_PROJECTS: JourneyItem[] = [
  { primary: "Hero Homes", secondary: "New Chandigarh · Omaxe", meta: "₹1.1–2.4 Cr", href: { to: "/projects/$slug" as const, params: { slug: "hero-homes" } } },
  { primary: "The Palm Drive", secondary: "Zirakpur · Emaar", meta: "₹0.9–1.6 Cr" },
];

const COMPARISON: JourneyItem[] = [
  { primary: "Hero Homes vs. The Palm Drive", secondary: "3 dimensions compared" },
];

const NOTES: JourneyItem[] = [
  { primary: "Prefer low-density towers", secondary: "Attached to New Chandigarh" },
  { primary: "Wait for metro alignment confirmation", secondary: "Attached to Hero Homes" },
];

const QUESTIONS: JourneyItem[] = [
  { primary: "Ask about water source and backup" },
  { primary: "Verify RERA carpet area vs. brochure" },
  { primary: "Clarify maintenance costs post-possession" },
];

const VISITS: JourneyItem[] = [
  { primary: "Hero Homes site visit", secondary: "Sat, 26 Jul · 11:00 AM", meta: "Confirmed" },
];



function JourneyPage() {
  return (
    <AppLayout>
      <PageHeader
        eyebrow="Workspace"
        title="My Journey"
        description="A private space to shortlist, compare, and refine your property decisions over time."
      />
      <Container>
        <div className="grid gap-4 py-10 lg:grid-cols-2">
          <JourneySection
            title="Recently viewed"
            icon={<Clock className="h-4 w-4" />}
            items={RECENTLY_VIEWED}
          />
          <JourneySection
            title="Upcoming visits"
            icon={<CalendarDays className="h-4 w-4" />}
            items={VISITS}
          />
          <JourneySection
            title="Saved places"
            icon={<MapPin className="h-4 w-4" />}
            items={SAVED_PLACES}
          />
          <JourneySection
            title="Saved builders"
            icon={<Building2 className="h-4 w-4" />}
            items={SAVED_BUILDERS}
          />
          <JourneySection
            title="Saved projects"
            icon={<Home className="h-4 w-4" />}
            items={SAVED_PROJECTS}
          />
          <JourneySection
            title="Comparison board"
            icon={<GitCompare className="h-4 w-4" />}
            items={COMPARISON}
          />
          <JourneySection
            title="Decision notes"
            icon={<StickyNote className="h-4 w-4" />}
            items={NOTES}
          />
          <JourneySection
            title="Questions for site visit"
            icon={<HelpCircle className="h-4 w-4" />}
            items={QUESTIONS}
          />
        </div>
      </Container>
    </AppLayout>
  );
}

function JourneySection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: JourneyItem[];
}) {
  return (
    <Card className="rounded-xl border-border bg-surface shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </span>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => {
            const body = (
              <div className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.primary}
                  </p>
                  {item.secondary && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.secondary}
                    </p>
                  )}
                </div>
                {item.meta && (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </div>
            );
            return (
              <li key={item.primary}>
                {item.href ? (
                  <Link
                    to={item.href.to}
                    className="block -mx-2 rounded px-2 hover:bg-muted/60"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
