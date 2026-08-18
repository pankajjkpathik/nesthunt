import { useQuery } from "@tanstack/react-query";
import { DiscoveryService } from "@/lib/services/discovery";

export function useDiscoveryProjects(enabled = true) {
  return useQuery({
    queryKey: ["discovery", "projects"],
    queryFn: () => DiscoveryService.listProjects(),
    enabled,
    staleTime: 60_000,
  });
}

export function useDiscoveryBuilders(enabled = true) {
  return useQuery({
    queryKey: ["discovery", "builders"],
    queryFn: () => DiscoveryService.listBuilders(),
    enabled,
    staleTime: 60_000,
  });
}

export function useDiscoveryPlaces(enabled = true) {
  return useQuery({
    queryKey: ["discovery", "places"],
    queryFn: () => DiscoveryService.listPlaces(),
    enabled,
    staleTime: 60_000,
  });
}
