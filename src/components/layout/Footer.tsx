import { Container } from "@/components/common/Container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-display text-sm font-bold text-foreground">
              NestHunt
            </span>
            <p className="text-xs text-muted-foreground">
              Make your next property decision with confidence.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NestHunt. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
