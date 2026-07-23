export type EntityType =
  | "place"
  | "builder"
  | "project"
  | "media"
  | "document"
  | "category"
  | "amenity"
  | "blog";

/** Human-readable labels used across the CMS. */
export const ENTITY_LABELS: Record<EntityType, string> = {
  place: "Place",
  builder: "Builder",
  project: "Project",
  media: "Media",
  document: "Document",
  category: "Category",
  amenity: "Amenity",
  blog: "Blog",
};

export const ENTITY_PLURALS: Record<EntityType, string> = {
  place: "Places",
  builder: "Builders",
  project: "Projects",
  media: "Media",
  document: "Documents",
  category: "Categories",
  amenity: "Amenities",
  blog: "Blog",
};

export interface EntityRef {
  type: EntityType;
  id: string;
}

/**
 * Known relationship kinds. Kept open (`string`) so future kinds can be added
 * without a type-level migration — services enforce validity at runtime.
 */
export type RelationshipKind =
  | "builder"
  | "place"
  | "builders"
  | "places"
  | "projects"
  | "media"
  | "documents"
  | "categories"
  | "amenities"
  | "nearby"
  | "awards"
  | "leadership"
  | "related";

export interface RelationshipRow {
  id: string;
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  kind: string;
  sortOrder: number;
  meta: Record<string, unknown>;
  createdAt: string;
}

/** Summary hydrated from the target entity table. */
export interface EntitySummary {
  type: EntityType;
  id: string;
  name: string;
  slug?: string | null;
  thumbnail?: string | null;
  subtitle?: string | null;
}

export interface RelatedEntity extends EntitySummary {
  relationshipId: string;
  kind: string;
  sortOrder: number;
}

export interface GraphNode {
  ref: EntityRef;
  label: string;
  slug?: string | null;
  children: Array<{
    kind: string;
    label: string;
    nodes: GraphNode[];
  }>;
}

export interface UsageEntry {
  type: EntityType;
  id: string;
  name: string;
  slug?: string | null;
  via: string;
}

export interface UsageReport {
  target: EntityRef;
  total: number;
  byType: Partial<Record<EntityType, number>>;
  samples: UsageEntry[];
}

export interface RelationshipDefinition {
  kind: string;
  fromType: EntityType;
  toType: EntityType;
  label: string;
  multiple: boolean;
  description?: string;
}

/**
 * Declarative catalogue of relationship kinds each entity type supports.
 * Used by RelationshipsTab and validation.
 */
export const RELATIONSHIP_CATALOG: RelationshipDefinition[] = [
  // Place
  { kind: "builders", fromType: "place", toType: "builder", label: "Builders", multiple: true },
  { kind: "projects", fromType: "place", toType: "project", label: "Projects", multiple: true },
  { kind: "media", fromType: "place", toType: "media", label: "Media", multiple: true },
  { kind: "documents", fromType: "place", toType: "document", label: "Documents", multiple: true },
  { kind: "categories", fromType: "place", toType: "category", label: "Categories", multiple: true },
  { kind: "amenities", fromType: "place", toType: "amenity", label: "Amenities", multiple: true },
  { kind: "nearby", fromType: "place", toType: "place", label: "Nearby places", multiple: true },
  // Builder
  { kind: "places", fromType: "builder", toType: "place", label: "Places served", multiple: true },
  { kind: "projects", fromType: "builder", toType: "project", label: "Projects", multiple: true },
  { kind: "media", fromType: "builder", toType: "media", label: "Media", multiple: true },
  { kind: "documents", fromType: "builder", toType: "document", label: "Documents", multiple: true },
  // Project
  { kind: "builder", fromType: "project", toType: "builder", label: "Builder", multiple: false },
  { kind: "place", fromType: "project", toType: "place", label: "Place", multiple: false },
  { kind: "media", fromType: "project", toType: "media", label: "Media", multiple: true },
  { kind: "documents", fromType: "project", toType: "document", label: "Documents", multiple: true },
  { kind: "amenities", fromType: "project", toType: "amenity", label: "Amenities", multiple: true },
  { kind: "related", fromType: "project", toType: "project", label: "Related projects", multiple: true },
];

export function getRelationshipsFor(type: EntityType): RelationshipDefinition[] {
  return RELATIONSHIP_CATALOG.filter((r) => r.fromType === type);
}
