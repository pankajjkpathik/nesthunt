import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Scale, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { PlaceholderCard } from "@/components/common/PlaceholderCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <AppLayout>
      {/* Hero */}
      <Container>
        <div className="grid gap-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Property Decision Intelligence
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Make your next property decision with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              NestHunt brings verified information, structured comparisons, and
              transparent explanations to every step of your property journey — so
              you can decide without the noise.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/journey">Explore the journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Principles */}
      <Section className="border-t border-border bg-surface">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built on three principles
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every module in NestHunt is designed around clarity, not persuasion.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Verified information"
            description="Every data point ties back to a source. No unverified listings, no marketing claims."
          />
          <PlaceholderCard
            icon={<Scale className="h-4 w-4" />}
            title="Structured comparisons"
            description="Compare places, builders, and projects on the dimensions that actually matter."
          />
          <PlaceholderCard
            icon={<BookOpen className="h-4 w-4" />}
            title="Transparent explanations"
            description="Every insight explains its reasoning, so you understand what you're deciding on."
          />
        </div>
      </Section>
    </AppLayout>
  );
}
