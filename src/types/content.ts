import type { Database } from "@/integrations/supabase/types";

export type ContentStatus = "draft" | "published" | "archived";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type AmenityRow = Database["public"]["Tables"]["amenities"]["Row"];
export type AmenityInsert = Database["public"]["Tables"]["amenities"]["Insert"];
export type AmenityUpdate = Database["public"]["Tables"]["amenities"]["Update"];

export type InfrastructureRow = Database["public"]["Tables"]["infrastructure_items"]["Row"];
export type InfrastructureInsert = Database["public"]["Tables"]["infrastructure_items"]["Insert"];
export type InfrastructureUpdate = Database["public"]["Tables"]["infrastructure_items"]["Update"];

export type InfrastructureLinkRow = Database["public"]["Tables"]["infrastructure_links"]["Row"];
export type InfrastructureLinkInsert = Database["public"]["Tables"]["infrastructure_links"]["Insert"];

export type UnitTypeRow = Database["public"]["Tables"]["unit_types"]["Row"];
export type UnitTypeInsert = Database["public"]["Tables"]["unit_types"]["Insert"];
export type UnitTypeUpdate = Database["public"]["Tables"]["unit_types"]["Update"];

export const AMENITY_CATEGORIES = [
  "lifestyle",
  "sports",
  "security",
  "health",
  "convenience",
  "green",
  "utilities",
  "children",
  "senior",
  "business",
] as const;
export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

export const INFRASTRUCTURE_CATEGORIES = [
  "hospital",
  "school",
  "university",
  "metro",
  "bus",
  "railway",
  "airport",
  "mall",
  "market",
  "business_district",
  "it_park",
  "park",
  "police",
  "fire",
  "bank",
  "other",
] as const;
export type InfrastructureCategory = (typeof INFRASTRUCTURE_CATEGORIES)[number];

export const UNIT_TYPE_CATEGORIES = ["residential", "commercial"] as const;
export type UnitTypeCategory = (typeof UNIT_TYPE_CATEGORIES)[number];

export interface ContentSeo {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface CategoryNode extends CategoryRow {
  children: CategoryNode[];
}

export interface ContentPickerItem {
  kind: "category" | "amenity" | "infrastructure" | "unit_type";
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  icon?: string | null;
  thumbnail?: string | null;
}
