import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NAV_GROUPS, type NavItem } from "@/lib/admin/nav";

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      await navigate({ to: "/admin/login", replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="mr-1 inline h-3 w-3" />
              Site
            </Link>

            <span className="text-sm font-semibold">NestHunt Admin</span>

            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
              CMS
            </span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px] gap-6 px-6 py-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <nav aria-label="Admin" className="space-y-5">
            {NAV_GROUPS.map((group, idx) => (
              <div key={group.label ?? `g-${idx}`}>
                {group.label ? (
                  <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                ) : null}
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLinkItem item={item} pathname={pathname} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavLinkItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact
    ? pathname === item.to
    : pathname === item.to || pathname.startsWith(item.to + "/");

  const base =
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <span
        aria-disabled
        className={cn(base, "cursor-not-allowed text-muted-foreground/60")}
        title="Coming soon"
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      className={cn(
        base,
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}
