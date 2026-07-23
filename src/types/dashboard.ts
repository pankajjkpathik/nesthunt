import type { LucideIcon } from "lucide-react";

export interface KPIStat {
  key: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { direction: "up" | "down" | "flat"; value: string };
  tone?: "default" | "success" | "warning" | "muted";
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityType: "place" | "builder" | "project" | "media" | "user" | "system";
  timestamp: string; // ISO
}

export interface LatestPlaceRow {
  id: string;
  name: string;
  city: string;
  builder: string;
  status: "draft" | "review" | "published";
  updatedAt: string;
}

export interface AnalyticsSummary {
  propertiesByCity: { label: string; value: number }[];
  publishedVsDraft: { published: number; draft: number; review: number };
  monthlyGrowth: { month: string; value: number }[];
  userActivity: { day: string; value: number }[];
}

export interface DashboardData {
  kpis: KPIStat[];
  activity: ActivityItem[];
  latestPlaces: LatestPlaceRow[];
  analytics: AnalyticsSummary;
}
