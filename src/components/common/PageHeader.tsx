import type { ReactNode } from "react";
import { Container } from "./Container";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Standard page header — eyebrow label, title, description, and optional actions.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-surface">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 py-10 sm:py-14">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </Container>
    </div>
  );
}
