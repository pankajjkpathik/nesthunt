/**
 * BUILDER INTELLIGENCE V1 FROZEN
 * 
 * Builder Intelligence V1 is feature-complete. Future changes should be limited 
 * to bug fixes, security fixes, data-integrity fixes and explicitly approved V2 work.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { useBuilders } from "@/hooks/useNestHunt";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/builders/")({
  component: BuildersIndexPage,
  head: () => ({
    meta: [
      { title: "Builder Intelligence — Verified Developer Track Records | NestHunt" },
      {
        name: "description",
        content: "Explore verified builder intelligence — delivery history, regulatory standing, financial stability and customer trust reports for India's leading developers.",
      },
      { property: "og:title", content: "Builder Intelligence — NestHunt" },
      { property: "og:description", content: "Explore verified builder intelligence — delivery history, regulatory standing and customer trust reports." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.nesthunt.in/builders" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.nesthunt.in/builders" }],
  }),
});

function BuildersIndexPage() {
  const { data: builders, isLoading } = useBuilders();

  return (
    <AppLayout>
      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-4 uppercase tracking-wider">
            Directory
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Builder Intelligence
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Make confident decisions with independent, data-driven track records for real estate developers.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))
          ) : builders?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No builders published yet.
            </div>
          ) : (
            builders?.map((builder) => (
              <Link
                key={builder.id}
                to={`/builders/${builder.slug}` as any}
                className="group relative flex flex-col rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/40 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {builder.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {builder.yearsActive ? `Est. ${new Date().getFullYear() - builder.yearsActive}` : "Verified Developer"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm text-muted-foreground line-clamp-2">
                  {builder.summary}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-medium text-accent">
                    View Intelligence
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  {builder.decision?.score ? (
                    <Badge variant="secondary" className="font-mono">
                      {Number(builder.decision.score) > 10 ? (Number(builder.decision.score) / 10).toFixed(1) : builder.decision.score} / 10
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      Pending
                    </Badge>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </AppLayout>
  );
}
