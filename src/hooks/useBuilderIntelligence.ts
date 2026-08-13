import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listBuilderLeadership,
  listBuilderCertifications,
  listBuilderAwards,
  listBuilderReraRecords,
  listBuilderFaqs,
  createBuilderChild,
  updateBuilderChild,
  deleteBuilderChild,
  type LeadershipMember,
  type CertificationEntry,
  type AwardEntry,
  type ReraEntry,
  type BuilderFaq,
} from "@/lib/services/builders-admin";
import {
  PromiseLedgerService,
  RiskService,
  type DecisionEntityType,
} from "@/lib/services/decision-intelligence";

export const builderIntellKeys = {
  leadership: (builderId: string) => ["admin", "builders", builderId, "leadership"] as const,
  certifications: (builderId: string) => ["admin", "builders", builderId, "certifications"] as const,
  awards: (builderId: string) => ["admin", "builders", builderId, "awards"] as const,
  rera: (builderId: string) => ["admin", "builders", builderId, "rera"] as const,
  faqs: (builderId: string) => ["admin", "builders", builderId, "faqs"] as const,
  risks: (builderId: string) => ["admin", "builders", builderId, "risks"] as const,
  promises: (builderId: string) => ["admin", "builders", builderId, "promises"] as const,
};

// --- Leadership Hooks ---
export function useBuilderLeadership(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.leadership(builderId ?? ""),
    queryFn: () => listBuilderLeadership(builderId!),
    enabled: !!builderId,
  });
}

export function useCreateBuilderLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<LeadershipMember> & { builder_id: string }) =>
      createBuilderChild("builder_leadership", payload),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.leadership(row.builder_id) }),
  });
}

export function useUpdateBuilderLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<LeadershipMember> }) =>
      updateBuilderChild("builder_leadership", id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.leadership(row.builder_id) }),
  });
}

export function useDeleteBuilderLeadership(builderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilderChild("builder_leadership", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: builderIntellKeys.leadership(builderId) }),
  });
}

// --- Certifications Hooks ---
export function useBuilderCertifications(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.certifications(builderId ?? ""),
    queryFn: () => listBuilderCertifications(builderId!),
    enabled: !!builderId,
  });
}

export function useCreateBuilderCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CertificationEntry> & { builder_id: string }) =>
      createBuilderChild("builder_certifications", payload),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.certifications(row.builder_id) }),
  });
}

export function useUpdateBuilderCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CertificationEntry> }) =>
      updateBuilderChild("builder_certifications", id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.certifications(row.builder_id) }),
  });
}

export function useDeleteBuilderCertification(builderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilderChild("builder_certifications", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: builderIntellKeys.certifications(builderId) }),
  });
}

// --- Awards Hooks ---
export function useBuilderAwards(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.awards(builderId ?? ""),
    queryFn: () => listBuilderAwards(builderId!),
    enabled: !!builderId,
  });
}

export function useCreateBuilderAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AwardEntry> & { builder_id: string }) =>
      createBuilderChild("builder_awards", payload),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.awards(row.builder_id) }),
  });
}

export function useUpdateBuilderAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AwardEntry> }) =>
      updateBuilderChild("builder_awards", id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.awards(row.builder_id) }),
  });
}

export function useDeleteBuilderAward(builderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilderChild("builder_awards", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: builderIntellKeys.awards(builderId) }),
  });
}

// --- RERA Hooks ---
export function useBuilderRera(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.rera(builderId ?? ""),
    queryFn: () => listBuilderReraRecords(builderId!),
    enabled: !!builderId,
  });
}

export function useCreateBuilderRera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ReraEntry> & { builder_id: string }) =>
      createBuilderChild("builder_rera_records", payload),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.rera(row.builder_id) }),
  });
}

export function useUpdateBuilderRera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ReraEntry> }) =>
      updateBuilderChild("builder_rera_records", id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.rera(row.builder_id) }),
  });
}

export function useDeleteBuilderRera(builderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilderChild("builder_rera_records", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: builderIntellKeys.rera(builderId) }),
  });
}

// --- FAQ Hooks ---
export function useBuilderFaqs(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.faqs(builderId ?? ""),
    queryFn: () => listBuilderFaqs(builderId!),
    enabled: !!builderId,
  });
}

export function useCreateBuilderFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BuilderFaq> & { builder_id: string }) =>
      createBuilderChild("builder_faqs", payload),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.faqs(row.builder_id) }),
  });
}

export function useUpdateBuilderFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BuilderFaq> }) =>
      updateBuilderChild("builder_faqs", id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: builderIntellKeys.faqs(row.builder_id) }),
  });
}

export function useDeleteBuilderFaq(builderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilderChild("builder_faqs", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: builderIntellKeys.faqs(builderId) }),
  });
}

// --- Generic Risks/Promises Hooks (Shared Intelligence Layer) ---
export function useBuilderRisks(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.risks(builderId ?? ""),
    queryFn: () => RiskService.listByEntity("builder", builderId!),
    enabled: !!builderId,
  });
}

export function useBuilderPromises(builderId: string | undefined) {
  return useQuery({
    queryKey: builderIntellKeys.promises(builderId ?? ""),
    queryFn: () => PromiseLedgerService.listByEntity("builder", builderId!),
    enabled: !!builderId,
  });
}
