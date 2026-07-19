import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGuard } from "@/components/admin/AdminGuard";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
  head: () => ({ meta: [{ title: "NestHunt Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminLayout() {
  return (
    <AdminGuard>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminGuard>
  );
}
