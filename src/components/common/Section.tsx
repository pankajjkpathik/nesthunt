import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  bleed?: boolean;
}

/**
 * Vertical rhythm block with consistent padding. Wraps children in a Container
 * unless `bleed` is set (for full-width sub-content).
 */
export function Section({
  className,
  bleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20", className)} {...props}>
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
