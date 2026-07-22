import { type ReactNode, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, signedIn, isAdmin } = useAdminSession();
  const [bootstrapping, setBootstrapping] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (!signedIn) {
    return <Navigate to="/admin/login" />;
  }

  if (!isAdmin) {
    async function claim() {
      setBootstrapping(true);
      const { data, error } = await supabase.rpc("bootstrap_admin");
      setBootstrapping(false);
      if (error) return toast.error(error.message);
      if (data === true) {
        toast.success("Admin role granted. Reloading…");
        window.location.reload();
      } else {
        toast.error("An admin already exists. Ask them to grant you access.");
      }
    }

    async function signOut() {
      await supabase.auth.signOut();
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is signed in but does not have the admin role. If you are the
              first user setting up NestHunt, claim the admin role below. This only works
              until the first admin exists.
            </p>
            <div className="flex gap-2">
              <Button onClick={claim} disabled={bootstrapping}>
                {bootstrapping ? "Claiming…" : "Claim admin role"}
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
