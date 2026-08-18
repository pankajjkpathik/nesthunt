import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type ProjectGovernanceRow = Tables["project_governance"]["Row"];
export type ProjectGovernanceInsert = Tables["project_governance"]["Insert"];
export type ProjectGovernanceUpdate = Tables["project_governance"]["Update"];

export type ProjectExceptionRow = Tables["project_exceptions"]["Row"];
export type ProjectExceptionInsert = Tables["project_exceptions"]["Insert"];
export type ProjectExceptionUpdate = Tables["project_exceptions"]["Update"];

export type IntakeStatus = Database["public"]["Enums"]["intake_status"];
export type VerificationLevel = Database["public"]["Enums"]["verification_level"];
export type ExceptionType = Database["public"]["Enums"]["exception_type"];
export type ExceptionStatus = Database["public"]["Enums"]["exception_status"];

export interface PublicationReadiness {
  isReady: boolean;
  checks: {
    label: string;
    passed: boolean;
    critical: boolean;
    reason?: string;
  }[];
}

export const ProjectGovernanceService = {
  async getGovernance(projectId: string): Promise<ProjectGovernanceRow | null> {
    const { data, error } = await supabase
      .from("project_governance")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async ensureGovernance(projectId: string): Promise<ProjectGovernanceRow> {
    const existing = await this.getGovernance(projectId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from("project_governance")
      .insert({ project_id: projectId, intake_status: "DRAFT", verification_level: "STANDARD" })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateGovernance(id: string, patch: ProjectGovernanceUpdate): Promise<ProjectGovernanceRow> {
    const { data, error } = await supabase
      .from("project_governance")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async listExceptions(projectId: string): Promise<ProjectExceptionRow[]> {
    const { data, error } = await supabase
      .from("project_exceptions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createException(input: ProjectExceptionInsert): Promise<ProjectExceptionRow> {
    const { data, error } = await supabase
      .from("project_exceptions")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async updateException(id: string, patch: ProjectExceptionUpdate): Promise<ProjectExceptionRow> {
    const updatePayload: ProjectExceptionUpdate = {
      ...patch,
      updated_at: new Date().toISOString(),
    };
    if (patch.status === "RESOLVED" || patch.status === "WAIVED") {
      updatePayload.resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from("project_exceptions")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  calculateReadiness(project: any, governance: ProjectGovernanceRow | null, exceptions: ProjectExceptionRow[]): PublicationReadiness {
    const checks: PublicationReadiness["checks"] = [];

    // 1. Identity
    checks.push({
      label: "Project Identity (Name/Slug)",
      passed: !!project.name && !!project.slug,
      critical: true,
    });

    // 2. Relations
    checks.push({
      label: "Builder Mapping",
      passed: !!project.builder_id,
      critical: true,
      reason: "Required for public project experience",
    });
    checks.push({
      label: "Place Mapping",
      passed: !!project.place_id,
      critical: true,
      reason: "Required for public project experience",
    });

    // 3. RERA
    checks.push({
      label: "RERA Registration",
      passed: !!project.rera_number,
      critical: true,
      reason: "Regulatory compliance check",
    });

    // 4. Governance Status
    checks.push({
      label: "Intake Verified",
      passed: governance?.intake_status === "VERIFIED",
      critical: false,
    });

    // 5. Open Exceptions
    const openCritical = exceptions.filter(e => 
      e.status === "OPEN" && 
      (e.type === "REGULATORY_REFERENCE" || e.type === "IDENTITY_CONFLICT" || e.type === "RERA_CONFLICT")
    );
    checks.push({
      label: "Critical Exceptions",
      passed: openCritical.length === 0,
      critical: true,
      reason: openCritical.length > 0 ? `${openCritical.length} critical issues open` : undefined,
    });

    const isReady = checks.every(c => !c.critical || c.passed);

    return { isReady, checks };
  },

  async getAdminStats() {
    // Note: In a real app, this might be a single aggregate query
    const { data: govData, error: govError } = await supabase.from("project_governance").select("intake_status, verification_level");
    const { data: projects, error: projError } = await supabase.from("projects").select("publish_status");
    
    if (govError || projError) throw govError || projError;

    return {
      total: projects?.length ?? 0,
      readyForQA: govData?.filter(g => g.intake_status === "DATA_REVIEW").length ?? 0,
      verified: govData?.filter(g => g.intake_status === "VERIFIED").length ?? 0,
      deepReview: govData?.filter(g => g.verification_level === "DEEP_REVIEW").length ?? 0,
      published: projects?.filter(p => p.publish_status === "published").length ?? 0,
    };
  }
};
