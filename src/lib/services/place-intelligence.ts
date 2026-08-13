import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// ---------- Types ----------
export type PlaceEvidenceRow = Database["public"]["Tables"]["place_evidence"]["Row"] & {
  builder_id?: string | null;
};
export type PlaceEvidenceInsert = Database["public"]["Tables"]["place_evidence"]["Insert"] & {
  builder_id?: string | null;
};
export type PlaceEvidenceUpdate = Database["public"]["Tables"]["place_evidence"]["Update"] & {
  builder_id?: string | null;
};

export type PlaceRiskRow = Database["public"]["Tables"]["place_risks"]["Row"] & {
  builder_id?: string | null;
};
export type PlaceRiskInsert = Database["public"]["Tables"]["place_risks"]["Insert"] & {
  builder_id?: string | null;
};
export type PlaceRiskUpdate = Database["public"]["Tables"]["place_risks"]["Update"] & {
  builder_id?: string | null;
};

export type PlacePromiseRow = Database["public"]["Tables"]["place_promises"]["Row"] & {
  builder_id?: string | null;
};
export type PlacePromiseInsert = Database["public"]["Tables"]["place_promises"]["Insert"] & {
  builder_id?: string | null;
};
export type PlacePromiseUpdate = Database["public"]["Tables"]["place_promises"]["Update"] & {
  builder_id?: string | null;
};

export const EVIDENCE_TYPES = [
  "article",
  "government_notification",
  "rera",
  "master_plan",
  "photo",
  "video",
  "report",
  "other",
] as const;

export const EVIDENCE_CATEGORIES = [
  "general",
  "infrastructure",
  "governance",
  "market",
  "legal",
  "environmental",
  "social",
] as const;

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export const VERIFICATION_STATUSES = ["unverified", "pending", "verified", "rejected"] as const;

export const RISK_CATEGORIES = [
  "legal",
  "infrastructure",
  "environmental",
  "market",
  "governance",
  "social",
  "general",
] as const;
export const RISK_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const RISK_PROBABILITIES = ["low", "medium", "high"] as const;
export const RISK_STATUSES = ["open", "monitoring", "mitigated", "closed"] as const;
export const RISK_REVIEW_CYCLES = ["monthly", "quarterly", "biannual", "annual", "adhoc"] as const;

export const PROMISE_STATUSES = [
  "Planned",
  "In Progress",
  "Delayed",
  "Completed",
  "Cancelled",
] as const;

// ---------- Evidence CRUD ----------
export async function listPlaceEvidence(placeId: string): Promise<PlaceEvidenceRow[]> {
  const { data, error } = await supabase
    .from("place_evidence")
    .select("*")
    .eq("place_id", placeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlaceEvidenceRow[];
}

export async function createPlaceEvidence(input: PlaceEvidenceInsert): Promise<PlaceEvidenceRow> {
  const { data: userRes } = await supabase.auth.getUser();
  const payload: PlaceEvidenceInsert = { ...input, created_by: input.created_by ?? userRes.user?.id ?? null };
  const { data, error } = await supabase.from("place_evidence").insert(payload as any).select("*").single();
  if (error) throw error;
  return data as PlaceEvidenceRow;
}

export async function updatePlaceEvidence(id: string, patch: PlaceEvidenceUpdate): Promise<PlaceEvidenceRow> {
  const { data, error } = await supabase.from("place_evidence").update(patch as any).eq("id", id).select("*").single();
  if (error) throw error;
  return data as PlaceEvidenceRow;
}

export async function deletePlaceEvidence(id: string): Promise<void> {
  const { error } = await supabase.from("place_evidence").delete().eq("id", id);
  if (error) throw error;
}

export async function verifyPlaceEvidence(id: string): Promise<PlaceEvidenceRow> {
  const { data: userRes } = await supabase.auth.getUser();
  return updatePlaceEvidence(id, {
    verification_status: "verified",
    verified_by: userRes.user?.id ?? null,
    review_date: new Date().toISOString().slice(0, 10),
  });
}

// ---------- Risks CRUD ----------
export async function listPlaceRisks(placeId: string): Promise<PlaceRiskRow[]> {
  const { data, error } = await supabase
    .from("place_risks")
    .select("*")
    .eq("place_id", placeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlaceRiskRow[];
}

export async function createPlaceRisk(input: PlaceRiskInsert): Promise<PlaceRiskRow> {
  const { data: userRes } = await supabase.auth.getUser();
  const payload: PlaceRiskInsert = { ...input, created_by: input.created_by ?? userRes.user?.id ?? null };
  const { data, error } = await supabase.from("place_risks").insert(payload as any).select("*").single();
  if (error) throw error;
  return data as PlaceRiskRow;
}

export async function updatePlaceRisk(id: string, patch: PlaceRiskUpdate): Promise<PlaceRiskRow> {
  const { data, error } = await supabase.from("place_risks").update(patch as any).eq("id", id).select("*").single();
  if (error) throw error;
  return data as PlaceRiskRow;
}

export async function deletePlaceRisk(id: string): Promise<void> {
  const { error } = await supabase.from("place_risks").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Promise Ledger CRUD ----------
export async function listPlacePromises(placeId: string): Promise<PlacePromiseRow[]> {
  const { data, error } = await supabase
    .from("place_promises")
    .select("*")
    .eq("place_id", placeId)
    .order("sort_order", { ascending: true })
    .order("announcement_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as PlacePromiseRow[];
}

export async function createPlacePromise(input: PlacePromiseInsert): Promise<PlacePromiseRow> {
  const { data: userRes } = await supabase.auth.getUser();
  const payload: PlacePromiseInsert = { ...input, created_by: input.created_by ?? userRes.user?.id ?? null };
  const { data, error } = await supabase.from("place_promises").insert(payload as any).select("*").single();
  if (error) throw error;
  return data as PlacePromiseRow;
}

export async function updatePlacePromise(id: string, patch: PlacePromiseUpdate): Promise<PlacePromiseRow> {
  const { data, error } = await supabase.from("place_promises").update(patch as any).eq("id", id).select("*").single();
  if (error) throw error;
  return data as PlacePromiseRow;
}

export async function deletePlacePromise(id: string): Promise<void> {
  const { error } = await supabase.from("place_promises").delete().eq("id", id);
  if (error) throw error;
}

