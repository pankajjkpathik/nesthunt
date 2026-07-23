import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { KPIGrid } from "@/components/admin/dashboard/KPIGrid";
import { AnalyticsSection } from "@/components/admin/dashboard/AnalyticsSection";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { LatestPlaces } from "@/components/admin/dashboard/LatestPlaces";
import { useDashboard } from "@/hooks/useDashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-8">
      <DashboardHeader title="Dashboard" />

      <section aria-label="KPI overview">
        <KPIGrid stats={data?.kpis ?? []} loading={isLoading} />
      </section>

      <section aria-label="Analytics">
        <AnalyticsSection data={data?.analytics} loading={isLoading} />
      </section>

      <section aria-label="Activity and actions" className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity items={data?.activity} loading={isLoading} />
        </div>
        <QuickActions />
      </section>

      <section aria-label="Latest places">
        <LatestPlaces rows={data?.latestPlaces} loading={isLoading} />
      </section>
    </div>
  );
}
