import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAdminSession } from "@/hooks/useAdmin";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, signedIn } = useAdminSession();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center">Checking session...</div>;
  }

  if (!signedIn) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}
