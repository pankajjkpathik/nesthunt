import { supabase } from "@/integrations/supabase/client";
import { getPublicUrl } from "@/lib/services/media";
import type {
  EntityRef,
  EntitySummary,
  EntityType,
  GraphNode,
  RelatedEntity,
  RelationshipRow,
  UsageEntry,
  UsageReport,
} from "@/types/relationships";
import { ENTITY_PLURALS, RELATIONSHIP_CATALOG } from "@/types/relationships";

/* ---------------- validation ---------------- */

export class RelationshipError extends Error {}

export function validateAttach(input: {
  from: EntityRef;
  to: EntityRef;
  kind: string;
}): void {
  const { from, to, kind } = input;
  if (from.type === to.type && from.id === to.id) {
    throw new RelationshipError("An entity cannot be linked to itself.");
  }
  const def = RELATIONSHIP_CATALOG.find(
    (d) => d.fromType === from.type && d.toType === to.type && d.kind === kind,
  );
  if (!def) {
    throw new RelationshipError(
      `Relationship "${kind}" between ${from.type} and ${to.type} is not allowed.`,
    );
  }
}

/* ---------------- row mapping ---------------- */

type DBRow = {
  id: string;
  from_type: EntityType;
  from_id: string;
  to_type: EntityType;
  to_id: string;
  kind: string;
  sort_order: number;
  meta: Record<string, unknown> | null;
  created_at: string;
};

function mapRow(r: DBRow): RelationshipRow {
  return {
    id: r.id,
    fromType: r.from_type,
    fromId: r.from_id,
    toType: r.to_type,
    toId: r.to_id,
    kind: r.kind,
    sortOrder: r.sort_order,
    meta: r.meta ?? {},
    createdAt: r.created_at,
  };
}

/* ---------------- entity hydration ---------------- */

interface HydrateOptions {
  includeArchived?: boolean;
}

async function hydrateSummaries(
  refs: EntityRef[],
  _opts?: HydrateOptions,
): Promise<Map<string, EntitySummary>> {
  const key = (r: EntityRef) => `${r.type}:${r.id}`;
  const out = new Map<string, EntitySummary>();
  if (!refs.length) return out;

  const byType = new Map<EntityType, string[]>();
  for (const r of refs) {
    const arr = byType.get(r.type) ?? [];
    arr.push(r.id);
    byType.set(r.type, arr);
  }

  await Promise.all(
    Array.from(byType.entries()).map(async ([type, ids]) => {
      const unique = Array.from(new Set(ids));
      if (type === "place") {
        const { data } = await supabase
          .from("places")
          .select("id,name,slug,region")
          .in("id", unique);
        for (const row of data ?? [])
          out.set(key({ type, id: row.id }), {
            type,
            id: row.id,
            name: row.name,
            slug: row.slug,
            subtitle: row.region,
          });
      } else if (type === "builder") {
        const { data } = await supabase
          .from("builders")
          .select("id,name,slug,headquarters,hero")
          .in("id", unique);
        for (const row of data ?? []) {
          const heroLogo =
            (row.hero as { logoUrl?: string } | null)?.logoUrl ?? null;
          out.set(key({ type, id: row.id }), {
            type,
            id: row.id,
            name: row.name,
            slug: row.slug,
            subtitle: row.headquarters,
            thumbnail: heroLogo,
          });
        }
      } else if (type === "project") {
        const { data } = await supabase
          .from("projects")
          .select("id,name,slug,status")
          .in("id", unique);
        for (const row of data ?? [])
          out.set(key({ type, id: row.id }), {
            type,
            id: row.id,
            name: row.name,
            slug: row.slug,
            subtitle: row.status,
          });
      } else if (type === "media") {
        const { data } = await supabase
          .from("media_assets")
          .select("id,file_name,folder,storage_path,mime_type")
          .in("id", unique);
        for (const row of data ?? [])
          out.set(key({ type, id: row.id }), {
            type,
            id: row.id,
            name: row.file_name,
            slug: null,
            subtitle: row.folder,
            thumbnail: row.mime_type?.startsWith("image/")
              ? getPublicUrl(row.storage_path)
              : null,
          });
      } else if (type === "document") {
        const { data } = await supabase
          .from("entity_documents")
          .select("id,title,kind")
          .in("id", unique);
        for (const row of data ?? [])
          out.set(key({ type, id: row.id }), {
            type,
            id: row.id,
            name: row.title,
            subtitle: row.kind,
          });
      } else {
        // category / amenity / blog — placeholder until dedicated tables exist
        for (const id of unique)
          out.set(key({ type, id }), { type, id, name: id, subtitle: type });
      }
    }),
  );

  return out;
}

/* ---------------- reads ---------------- */

export async function listRelationships(from: EntityRef, kind?: string): Promise<RelationshipRow[]> {
  let q = supabase
    .from("entity_relationships")
    .select("*")
    .eq("from_type", from.type)
    .eq("from_id", from.id)
    .order("sort_order")
    .order("created_at");
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data as DBRow[] | null ?? []).map(mapRow);
}

export async function getRelatedEntities(
  from: EntityRef,
  kind?: string,
): Promise<RelatedEntity[]> {
  const rows = await listRelationships(from, kind);
  const map = await hydrateSummaries(
    rows.map((r) => ({ type: r.toType, id: r.toId })),
  );
  return rows
    .map<RelatedEntity | null>((r) => {
      const s = map.get(`${r.toType}:${r.toId}`);
      if (!s) return null;
      return { ...s, relationshipId: r.id, kind: r.kind, sortOrder: r.sortOrder };
    })
    .filter((x): x is RelatedEntity => x !== null);
}

/* ---------------- writes ---------------- */

export async function attachEntity(input: {
  from: EntityRef;
  to: EntityRef;
  kind: string;
  meta?: Record<string, unknown>;
  sortOrder?: number;
}): Promise<RelationshipRow> {
  validateAttach(input);
  // enforce single-cardinality by removing prior entries first
  const def = RELATIONSHIP_CATALOG.find(
    (d) =>
      d.fromType === input.from.type &&
      d.toType === input.to.type &&
      d.kind === input.kind,
  );
  if (def && !def.multiple) {
    await supabase
      .from("entity_relationships")
      .delete()
      .eq("from_type", input.from.type)
      .eq("from_id", input.from.id)
      .eq("to_type", input.to.type)
      .eq("kind", input.kind);
  }
  const { data, error } = await supabase
    .from("entity_relationships")
    .upsert(
      {
        from_type: input.from.type,
        from_id: input.from.id,
        to_type: input.to.type,
        to_id: input.to.id,
        kind: input.kind,
        sort_order: input.sortOrder ?? 0,
        meta: (input.meta ?? {}) as never,
      },
      { onConflict: "from_type,from_id,to_type,to_id,kind" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as DBRow);
}

export async function detachEntity(relationshipId: string): Promise<void> {
  const { error } = await supabase
    .from("entity_relationships")
    .delete()
    .eq("id", relationshipId);
  if (error) throw error;
}

export async function detachByRef(input: {
  from: EntityRef;
  to: EntityRef;
  kind: string;
}): Promise<void> {
  const { error } = await supabase
    .from("entity_relationships")
    .delete()
    .eq("from_type", input.from.type)
    .eq("from_id", input.from.id)
    .eq("to_type", input.to.type)
    .eq("to_id", input.to.id)
    .eq("kind", input.kind);
  if (error) throw error;
}

export async function syncRelationships(input: {
  from: EntityRef;
  toType: EntityType;
  kind: string;
  targetIds: string[];
}): Promise<void> {
  const { from, toType, kind, targetIds } = input;
  const existing = await listRelationships(from, kind);
  const existingIds = new Set(existing.filter((r) => r.toType === toType).map((r) => r.toId));
  const target = new Set(targetIds);

  const toAdd = targetIds.filter((id) => !existingIds.has(id));
  const toRemove = existing.filter((r) => r.toType === toType && !target.has(r.toId));

  await Promise.all([
    ...toAdd.map((id) =>
      attachEntity({ from, to: { type: toType, id }, kind }).catch((e) => {
        console.warn(`sync attach failed`, e);
      }),
    ),
    ...toRemove.map((r) => detachEntity(r.id)),
  ]);
}

export async function moveRelationship(input: {
  relationshipId: string;
  newSortOrder: number;
}): Promise<void> {
  const { error } = await supabase
    .from("entity_relationships")
    .update({ sort_order: input.newSortOrder })
    .eq("id", input.relationshipId);
  if (error) throw error;
}

export async function replaceRelationship(input: {
  from: EntityRef;
  kind: string;
  oldToId: string;
  newTo: EntityRef;
}): Promise<void> {
  await detachByRef({
    from: input.from,
    to: { type: input.newTo.type, id: input.oldToId },
    kind: input.kind,
  });
  await attachEntity({ from: input.from, to: input.newTo, kind: input.kind });
}

/* ---------------- usage / dependencies ---------------- */

export async function getUsage(target: EntityRef): Promise<UsageReport> {
  // relationships pointing at target
  const { data: incoming } = await supabase
    .from("entity_relationships")
    .select("id,from_type,from_id,kind")
    .eq("to_type", target.type)
    .eq("to_id", target.id);

  const samples: UsageEntry[] = [];
  const byType: Partial<Record<EntityType, number>> = {};
  const refs: EntityRef[] = [];

  for (const r of (incoming ?? []) as Array<{
    id: string;
    from_type: EntityType;
    from_id: string;
    kind: string;
  }>) {
    byType[r.from_type] = (byType[r.from_type] ?? 0) + 1;
    refs.push({ type: r.from_type, id: r.from_id });
  }

  // Also count legacy foreign keys so nothing gets silently deleted
  if (target.type === "builder") {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("builder_id", target.id);
    if (count) byType.project = (byType.project ?? 0) + count;
    const { data: bp } = await supabase
      .from("builder_places")
      .select("place_id")
      .eq("builder_id", target.id);
    if (bp?.length) byType.place = (byType.place ?? 0) + bp.length;
    for (const row of bp ?? []) refs.push({ type: "place", id: row.place_id });
  }
  if (target.type === "place") {
    const { count } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("place_id", target.id);
    if (count) byType.project = (byType.project ?? 0) + count;
    const { data: bp } = await supabase
      .from("builder_places")
      .select("builder_id")
      .eq("place_id", target.id);
    if (bp?.length) byType.builder = (byType.builder ?? 0) + bp.length;
    for (const row of bp ?? []) refs.push({ type: "builder", id: row.builder_id });
  }
  if (target.type === "media") {
    const { data: mu } = await supabase
      .from("media_usages")
      .select("id,entity_type,entity_id")
      .eq("media_id", target.id);
    for (const row of mu ?? []) {
      byType[row.entity_type as EntityType] =
        (byType[row.entity_type as EntityType] ?? 0) + 1;
      refs.push({ type: row.entity_type as EntityType, id: row.entity_id });
    }
  }

  const hydrated = await hydrateSummaries(refs.slice(0, 20));
  for (const [k, s] of hydrated)
    samples.push({ type: s.type, id: s.id, name: s.name, slug: s.slug, via: k.split(":")[0] });

  const total = Object.values(byType).reduce((a, b) => a + (b ?? 0), 0);
  return { target, total, byType, samples };
}

/* ---------------- graph ---------------- */

export async function getEntityGraph(
  root: EntityRef,
  depth: 0 | 1 | 2 = 1,
): Promise<GraphNode> {
  const rootSummary = (await hydrateSummaries([root])).get(`${root.type}:${root.id}`);
  const label = rootSummary?.name ?? root.id;

  if (depth === 0) return { ref: root, label, slug: rootSummary?.slug, children: [] };

  const related = await getRelatedEntities(root);
  const byKind = new Map<string, RelatedEntity[]>();
  for (const r of related) {
    const arr = byKind.get(r.kind) ?? [];
    arr.push(r);
    byKind.set(r.kind, arr);
  }

  // Include legacy FKs for a complete picture
  if (root.type === "builder") {
    const { data } = await supabase
      .from("projects")
      .select("id,name,slug")
      .eq("builder_id", root.id);
    if (data?.length) {
      const arr = byKind.get("projects") ?? [];
      for (const row of data) {
        if (!arr.some((r) => r.id === row.id))
          arr.push({
            type: "project",
            id: row.id,
            name: row.name,
            slug: row.slug,
            relationshipId: `fk:${row.id}`,
            kind: "projects",
            sortOrder: 0,
          });
      }
      byKind.set("projects", arr);
    }
  }
  if (root.type === "place") {
    const { data } = await supabase
      .from("projects")
      .select("id,name,slug")
      .eq("place_id", root.id);
    if (data?.length) {
      const arr = byKind.get("projects") ?? [];
      for (const row of data) {
        if (!arr.some((r) => r.id === row.id))
          arr.push({
            type: "project",
            id: row.id,
            name: row.name,
            slug: row.slug,
            relationshipId: `fk:${row.id}`,
            kind: "projects",
            sortOrder: 0,
          });
      }
      byKind.set("projects", arr);
    }
  }

  const children = await Promise.all(
    Array.from(byKind.entries()).map(async ([kind, list]) => ({
      kind,
      label: labelForKind(root.type, kind, list),
      nodes: await Promise.all(
        list.map(async (r) =>
          depth === 2
            ? await getEntityGraph({ type: r.type, id: r.id }, 1)
            : { ref: { type: r.type, id: r.id }, label: r.name, slug: r.slug, children: [] },
        ),
      ),
    })),
  );

  return { ref: root, label, slug: rootSummary?.slug, children };
}

function labelForKind(fromType: EntityType, kind: string, items: RelatedEntity[]): string {
  const def = RELATIONSHIP_CATALOG.find((d) => d.fromType === fromType && d.kind === kind);
  return `${def?.label ?? ENTITY_PLURALS[items[0]?.type ?? "media"]} (${items.length})`;
}

/* ---------------- search ---------------- */

export interface EntitySearchResult extends EntitySummary {}

export async function searchEntities(input: {
  types: EntityType[];
  query: string;
  limit?: number;
  excludeIds?: string[];
}): Promise<EntitySearchResult[]> {
  const q = input.query.trim();
  const limit = input.limit ?? 20;
  const results: EntitySearchResult[] = [];

  await Promise.all(
    input.types.map(async (type) => {
      if (type === "place") {
        let b = supabase.from("places").select("id,name,slug,region").limit(limit);
        if (q) b = b.ilike("name", `%${q}%`);
        const { data } = await b;
        for (const r of data ?? [])
          results.push({ type, id: r.id, name: r.name, slug: r.slug, subtitle: r.region });
      } else if (type === "builder") {
        let b = supabase.from("builders").select("id,name,slug,headquarters,hero").limit(limit);
        if (q) b = b.ilike("name", `%${q}%`);
        const { data } = await b;
        for (const r of data ?? [])
          results.push({
            type,
            id: r.id,
            name: r.name,
            slug: r.slug,
            subtitle: r.headquarters,
            thumbnail: (r.hero as { logoUrl?: string } | null)?.logoUrl ?? null,
          });
      } else if (type === "project") {
        let b = supabase.from("projects").select("id,name,slug,status").limit(limit);
        if (q) b = b.ilike("name", `%${q}%`);
        const { data } = await b;
        for (const r of data ?? [])
          results.push({ type, id: r.id, name: r.name, slug: r.slug, subtitle: r.status });
      } else if (type === "media") {
        let b = supabase
          .from("media_assets")
          .select("id,file_name,folder,storage_path,mime_type")
          .limit(limit);
        if (q) b = b.ilike("file_name", `%${q}%`);
        const { data } = await b;
        for (const r of data ?? [])
          results.push({
            type,
            id: r.id,
            name: r.file_name,
            subtitle: r.folder,
            thumbnail: r.mime_type?.startsWith("image/") ? getPublicUrl(r.storage_path) : null,
          });
      }
    }),
  );

  const excluded = new Set(input.excludeIds ?? []);
  return results.filter((r) => !excluded.has(r.id));
}

/* ---------------- health dashboard queries ---------------- */

export async function getRelationshipHealth() {
  const [
    total,
    orphanedProjects,
    placesWithoutProjects,
    buildersWithoutProjects,
    unlinkedMedia,
    placesWithoutBuilders,
    buildersMissingLogo,
    projectsMissingSeo,
  ] = await Promise.all([
    supabase.from("entity_relationships").select("id", { count: "exact", head: true }),
    supabase.rpc("rel_orphaned_projects"),
    supabase.rpc("rel_places_without_projects"),
    supabase.rpc("rel_builders_without_projects"),
    supabase.rpc("rel_unlinked_media"),
    supabase.rpc("rel_places_without_builders"),
    supabase.from("builders").select("id,name,slug,hero").limit(500),
    supabase.from("projects").select("id,name,slug,seo").limit(500),
  ]);

  const missingLogo =
    (buildersMissingLogo.data ?? []).filter((b) => {
      const logo = (b.hero as { logoUrl?: string } | null)?.logoUrl;
      return !logo;
    }) ?? [];

  const missingSeo =
    (projectsMissingSeo.data ?? []).filter((p) => {
      const seo = p.seo as { title?: string; description?: string } | null;
      return !seo?.title || !seo?.description;
    }) ?? [];

  return {
    totalRelationships: total.count ?? 0,
    orphanedProjects: (orphanedProjects.data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      missing: string;
    }>,
    placesWithoutProjects: (placesWithoutProjects.data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
    }>,
    buildersWithoutProjects: (buildersWithoutProjects.data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
    }>,
    unlinkedMedia: (unlinkedMedia.data ?? []) as Array<{
      id: string;
      file_name: string;
      folder: string;
    }>,
    placesWithoutBuilders: (placesWithoutBuilders.data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
    }>,
    buildersMissingLogo: missingLogo,
    projectsMissingSeo: missingSeo,
  };
}
