import type { KPIStat } from "@/types/dashboard";
import { KPICard } from "./KPICard";

export function KPIGrid({ stats, loading }: { stats: KPIStat[]; loading?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <KPICard key={s.key} stat={s} loading={loading} />
      ))}
    </div>
  );
}
