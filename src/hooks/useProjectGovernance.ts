import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectGovernanceService, type ProjectGovernanceUpdate, type ProjectExceptionInsert, type ProjectExceptionUpdate } from "@/lib/services/project-governance";
import { toast } from "sonner";

export function useProjectGovernance(projectId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "projects", projectId, "governance"],
    queryFn: () => ProjectGovernanceService.ensureGovernance(projectId!),
    enabled: !!projectId,
  });
}

export function useProjectExceptions(projectId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "projects", projectId, "exceptions"],
    queryFn: () => ProjectGovernanceService.listExceptions(projectId!),
    enabled: !!projectId,
  });
}

export function useUpdateGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch, projectId }: { id: string; patch: ProjectGovernanceUpdate; projectId: string }) =>
      ProjectGovernanceService.updateGovernance(id, patch),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "projects", variables.projectId, "governance"] });
      toast.success("Governance status updated");
    },
  });
}

export function useCreateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectExceptionInsert) => ProjectGovernanceService.createException(input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "projects", data.project_id, "exceptions"] });
      toast.success("Exception flag added");
    },
  });
}

export function useUpdateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProjectExceptionUpdate }) =>
      ProjectGovernanceService.updateException(id, patch),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "projects", data.project_id, "exceptions"] });
      toast.success("Exception status updated");
    },
  });
}

export function useAdminGovernanceStats() {
  return useQuery({
    queryKey: ["admin", "governance", "stats"],
    queryFn: () => ProjectGovernanceService.getAdminStats(),
  });
}
