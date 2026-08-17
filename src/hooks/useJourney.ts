import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { JourneyService, type JourneyEntityType } from "@/lib/services/journey";

export const JOURNEY_QUERY_KEY = ["journey"];

export function useJourney() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: JOURNEY_QUERY_KEY,
    queryFn: () => JourneyService.getItems(),
  });

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    };

    window.addEventListener("journey-updated", handleUpdate);
    return () => window.removeEventListener("journey-updated", handleUpdate);
  }, [queryClient]);

  const addMutation = useMutation({
    mutationFn: ({ type, id }: { type: JourneyEntityType; id: string }) =>
      Promise.resolve(JourneyService.addItem(type, id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ type, id }: { type: JourneyEntityType; id: string }) =>
      Promise.resolve(JourneyService.removeItem(type, id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isSaved: (type: JourneyEntityType, id: string) =>
      query.data?.some((item) => item.type === type && item.id === id) ?? false,
    add: (type: JourneyEntityType, id: string) => addMutation.mutate({ type, id }),
    remove: (type: JourneyEntityType, id: string) => removeMutation.mutate({ type, id }),
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
