import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type IntakeStatus = 'DRAFT' | 'DATA_REVIEW' | 'VERIFIED';
export type VerificationLevel = 'STANDARD' | 'ENHANCED' | 'DEEP_REVIEW';
export type ExceptionType = 
    | 'RERA_CONFLICT' | 'IDENTITY_CONFLICT' | 'BUILDER_CONFLICT' | 'PLACE_CONFLICT'
    | 'POSSESSION_CONFLICT' | 'PROGRESS_OUTDATED' | 'MISSING_RERA' | 'MISSING_EVIDENCE'
    | 'REGULATORY_REFERENCE' | 'PRICE_UNAVAILABLE';
export type ExceptionStatus = 'OPEN' | 'RESOLVED' | 'WAIVED';

export interface ProjectGovernanceRow {
  id: string;
  project_id: string;
  intake_status: IntakeStatus;
  verification_level: VerificationLevel;
  created_at: string;
  updated_at: string;
}

export interface ProjectExceptionRow {
  id: string;
  project_id: string;
  type: ExceptionType;
  status: ExceptionStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export type ProjectGovernanceUpdate = Partial<Omit<ProjectGovernanceRow, 'id' | 'project_id' | 'created_at'>>;
export type ProjectExceptionInsert = Omit<ProjectExceptionRow, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>;
export type ProjectExceptionUpdate = Partial<Omit<ProjectExceptionRow, 'id' | 'project_id' | 'created_at'>>;

export interface PublicationReadiness {
  isReady: boolean;
  checks: {
    label: string;
    passed: boolean;
    critical: boolean;
    reason?: string;
  }[];
}

const GOV_TABLE = "project_governance";
const EXC_TABLE = "project_exceptions";

export const ProjectGovernanceService = {
  async getGovernance(projectId: string): Promise<ProjectGovernanceRow | null> {
    const { data, error } = await supabaseAdmin
      .from(GOV_TABLE as any)
      .select("*")
      .eq("project_id", projectId as any)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as ProjectGovernanceRow) || null;
  },

  async ensureGovernance(projectId: string): Promise<ProjectGovernanceRow> {
    const existing = await this.getGovernance(projectId);
    if (existing) return existing;

    const { data, error } = await supabaseAdmin
      .from(GOV_TABLE as any)
      .insert({ project_id: projectId, intake_status: 'DRAFT', verification_level: 'STANDARD' })
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as ProjectGovernanceRow;
  },

  async updateGovernance(id: string, patch: ProjectGovernanceUpdate): Promise<ProjectGovernanceRow> {
    const { data, error } = await supabaseAdmin
      .from(GOV_TABLE as any)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as ProjectGovernanceRow;
  },

  async listExceptions(projectId: string): Promise<ProjectExceptionRow[]> {
    const { data, error } = await supabaseAdmin
      .from(EXC_TABLE as any)
      .select("*")
      .eq("project_id", projectId as any)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as ProjectExceptionRow[];
  },

  async createException(input: ProjectExceptionInsert): Promise<ProjectExceptionRow> {
    const { data, error } = await supabaseAdmin
      .from(EXC_TABLE as any)
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as ProjectExceptionRow;
  },

  async updateException(id: string, patch: ProjectExceptionUpdate): Promise<ProjectExceptionRow> {
    const updatePayload: any = {
      ...patch,
      updated_at: new Date().toISOString(),
    };
    if (patch.status === "RESOLVED" || patch.status === "WAIVED") {
      updatePayload.resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabaseAdmin
      .from(EXC_TABLE as any)
      .update(updatePayload)
      .eq("id", id as any)
      .select("*")
      .single();
    if (error) throw error;
    return data as unknown as ProjectExceptionRow;
  },

  calculateReadiness(project: { name?: string | null; slug?: string | null; builder_id?: string | null; place_id?: string | null; rera_number?: string | null }, governance: ProjectGovernanceRow | null, exceptions: ProjectExceptionRow[]): PublicationReadiness {
    const checks: PublicationReadiness["checks"] = [];

    checks.push({
      label: "Project Identity (Name/Slug)",
      passed: !!project.name && !!project.slug,
      critical: true,
    });

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

    checks.push({
      label: "RERA Registration",
      passed: !!project.rera_number,
      critical: true,
      reason: "Regulatory compliance check",
    });

    checks.push({
      label: "Intake Verified",
      passed: governance?.intake_status === "VERIFIED",
      critical: false,
    });

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
    const { data: govData, error: govError } = await supabaseAdmin.from(GOV_TABLE as any).select("intake_status, verification_level");
    const { data: projects, error: projError } = await supabaseAdmin.from("projects").select("publish_status");
    
    if (govError || projError) throw govError || projError;

    return {
      total: projects?.length ?? 0,
      readyForQA: govData?.filter((g: any) => g.intake_status === "DATA_REVIEW").length ?? 0,
      verified: govData?.filter((g: any) => g.intake_status === "VERIFIED").length ?? 0,
      deepReview: govData?.filter((g: any) => g.verification_level === "DEEP_REVIEW").length ?? 0,
      published: projects?.filter((p: any) => p.publish_status === "published").length ?? 0,
    };
  }
};
