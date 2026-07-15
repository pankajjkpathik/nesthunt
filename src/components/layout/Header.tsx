import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/Container";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/places/new-chandigarh", label: "Places" },
  { to: "/builder/omaxe", label: "Builders" },
  { to: "/project/hero-homes", label: "Projects" },
  { to: "/journey", label: "My Journey" },
] as const;

/**
 * Wordmark placeholder. Reserves fixed height so a future logo asset
 * can drop in without shifting the header layout.
 */
function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="NestHunt — home"
      className="flex h-8 items-center"
    >
      <span
        className="font-display text-lg font-bold tracking-tight text-foreground"
        data-slot="brand-wordmark"
      >
        NestHunt
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <Container>
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4">
          <Wordmark />

          <nav
            aria-label="Primary"
            className="hidden justify-center md:flex"
          >
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    activeProps={{
                      className:
                        "rounded-md px-3 py-2 text-sm font-medium text-foreground bg-muted",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign in
              </Button>
              <Button size="sm" className="text-sm">
                Get started
              </Button>
            </div>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-foreground md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200 md:hidden",
            open ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0">
            <ul className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    activeProps={{
                      className:
                        "block rounded-md px-3 py-2 text-sm font-medium text-foreground bg-muted",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-2 border-t border-border pt-3">
                <Button variant="ghost" size="sm" className="flex-1">
                  Sign in
                </Button>
                <Button size="sm" className="flex-1">
                  Get started
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </header>
  );
}
