import { useQuery } from "@tanstack/react-query";
import { ComparisonService } from "@/lib/services/comparison";

export function useProjectComparison(projectIds: string[]) {
  return useQuery({
    queryKey: ["comparison", "projects", projectIds.sort().join(",")],
    queryFn: () => ComparisonService.getProjectComparison(projectIds),
    enabled: projectIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
