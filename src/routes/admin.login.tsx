import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_DEMO_PIN, signInAdmin } from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin sign in — NestHunt" }, { name: "robots", content: "noindex" }] }),
});

function AdminLogin() {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">NestHunt Admin</CardTitle>
          <p className="text-xs text-muted-foreground">
            Temporary access. Full authentication ships in a later build.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (signInAdmin(pin)) {
                setErr(null);
                navigate({ to: "/admin" });
              } else {
                setErr("Invalid access code.");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="pin">Access code</Label>
              <Input
                id="pin"
                autoFocus
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter access code"
              />
              <p className="text-[11px] text-muted-foreground">
                Demo code: <code className="font-mono">{ADMIN_DEMO_PIN}</code>
              </p>
            </div>
            {err ? <p className="text-xs text-destructive">{err}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
              Back to site
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
