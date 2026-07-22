import { type ReactNode } from "react";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const { loading, signedIn, isAdmin } = useAdminSession();

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();

      await navigate({
        to: "/admin/login",
        replace: true,
      });
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">Checking session...</div>;
  }

  if (!signedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is signed in, but it does not have the
              <strong> admin </strong>
              role.
            </p>

            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
