import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Building2,
  Boxes,
  Image as ImageIcon,
  CheckCircle2,
  FileEdit,
  Users,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type {
  ActivityItem,
  AnalyticsSummary,
  DashboardData,
  KPIStat,
  LatestPlaceRow,
} from "@/types/dashboard";

/**
 * Central dashboard data hook.
 * Places KPIs come from Supabase; other KPIs & sections use placeholder data
 * until their respective modules land. UI is unaffected when they go live.
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data: places, error } = await supabase
        .from("places")
        .select("id, name, region, status, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const rows = places ?? [];
      const total = rows.length;
      const published = rows.filter((p) => p.status === "published").length;
      const drafts = rows.filter((p) => p.status === "draft").length;
      const review = rows.filter((p) => p.status === "review").length;

      const kpis: KPIStat[] = [
        { key: "places", label: "Places", value: total, icon: MapPin, description: "Total locations tracked", trend: { direction: "up", value: "+2 this week" } },
        { key: "builders", label: "Builders", value: "—", icon: Building2, description: "Verified developers", tone: "muted" },
        { key: "projects", label: "Projects", value: "—", icon: Boxes, description: "Active listings", tone: "muted" },
        { key: "media", label: "Media", value: "—", icon: ImageIcon, description: "Assets in library", tone: "muted" },
        { key: "published", label: "Published", value: published, icon: CheckCircle2, description: "Live on site", tone: "success", trend: { direction: "up", value: `${published}/${total || 1}` } },
        { key: "drafts", label: "Drafts", value: drafts, icon: FileEdit, description: "Awaiting edits", tone: "warning" },
        { key: "users", label: "Users", value: "—", icon: Users, description: "Registered members", tone: "muted" },
        { key: "reviews", label: "Reviews", value: "—", icon: Star, description: "Pending moderation", tone: "muted" },
      ];

      const latestPlaces: LatestPlaceRow[] = rows.slice(0, 8).map((p) => ({
        id: p.id,
        name: p.name,
        city: p.region ?? "—",
        builder: "—",
        status: (p.status as LatestPlaceRow["status"]) ?? "draft",
        updatedAt: p.updated_at,
      }));

      const activity: ActivityItem[] = rows.slice(0, 6).map((p, i) => ({
        id: `${p.id}-${i}`,
        user: "System",
        action: p.status === "published" ? "Published" : p.status === "review" ? "Submitted for review" : "Updated draft",
        entity: p.name,
        entityType: "place",
        timestamp: p.updated_at,
      }));

      const analytics: AnalyticsSummary = {
        propertiesByCity: aggregateByCity(rows),
        publishedVsDraft: { published, draft: drafts, review },
        monthlyGrowth: [
          { month: "Jul", value: 4 }, { month: "Aug", value: 6 }, { month: "Sep", value: 8 },
          { month: "Oct", value: 11 }, { month: "Nov", value: 14 }, { month: "Dec", value: total },
        ],
        userActivity: [
          { day: "Mon", value: 12 }, { day: "Tue", value: 18 }, { day: "Wed", value: 14 },
          { day: "Thu", value: 22 }, { day: "Fri", value: 26 }, { day: "Sat", value: 9 }, { day: "Sun", value: 6 },
        ],
      };

      return { kpis, activity, latestPlaces, analytics };
    },
    staleTime: 60_000,
  });
}

function aggregateByCity(rows: { region: string | null }[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = r.region ?? "Unknown";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
