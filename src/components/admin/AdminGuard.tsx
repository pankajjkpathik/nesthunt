import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/useAdmin";

/**
 * TEMPORARY guard. Uses a mock localStorage flag until Supabase auth
 * + user_roles are wired for the admin section.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const signedIn = useAdminSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!signedIn) navigate({ to: "/admin/login" });
  }, [signedIn, navigate]);

  if (!signedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }
  return <>{children}</>;
}
