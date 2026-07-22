import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, signedIn, isAdmin } = useAdminSession();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">Checking session...</div>;
  }

  if (!signedIn) {
    return <Navigate to="/admin/login" />;
  }

  if (!isAdmin) {
    async function signOut() {
      await supabase.auth.signOut();
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is authenticated but has not been granted the
              <strong> admin </strong>
              role.
            </p>

            <Button variant="outline" className="w-full" onClick={signOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
