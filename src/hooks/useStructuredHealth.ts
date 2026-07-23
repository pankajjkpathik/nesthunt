import { useQuery } from "@tanstack/react-query";
import { getContentHealth } from "@/lib/services/structuredHealth";

export function useStructuredHealth() {
  return useQuery({
    queryKey: ["content", "health"],
    queryFn: getContentHealth,
    staleTime: 30_000,
  });
}
