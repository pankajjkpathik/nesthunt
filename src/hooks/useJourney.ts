import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { 
  JourneyService, 
  type JourneyEntityType, 
  type JourneyItem,
  type UserPreference,
  type UserPreferencePriority
} from "@/lib/services/journey";

export const JOURNEY_QUERY_KEY = ["journey"];

export function useJourney() {
  const queryClient = useQueryClient();

  const journeyQuery = useQuery({
    queryKey: JOURNEY_QUERY_KEY,
    queryFn: () => ({
      items: JourneyService.getItems(),
      preferences: JourneyService.getPreferences(),
    }),
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

  const setPreferenceMutation = useMutation({
    mutationFn: (preference: UserPreference) =>
      Promise.resolve(JourneyService.setPreference(preference)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    },
  });

  const removePreferenceMutation = useMutation({
    mutationFn: (dimensionId: string) =>
      Promise.resolve(JourneyService.removePreference(dimensionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    },
  });

  const resetPreferencesMutation = useMutation({
    mutationFn: () => Promise.resolve(JourneyService.resetPreferences()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    },
  });

  return {
    items: journeyQuery.data?.items ?? [],
    preferences: journeyQuery.data?.preferences ?? [],
    isLoading: journeyQuery.isLoading,
    isSaved: (type: JourneyEntityType, id: string) =>
      journeyQuery.data?.items.some((item) => item.type === type && item.id === id) ?? false,
    add: (type: JourneyEntityType, id: string) => addMutation.mutate({ type, id }),
    remove: (type: JourneyEntityType, id: string) => removeMutation.mutate({ type, id }),
    setPreference: (dimensionId: string, priority: UserPreferencePriority) => 
      setPreferenceMutation.mutate({ dimensionId, priority }),
    removePreference: (dimensionId: string) => removePreferenceMutation.mutate(dimensionId),
    resetPreferences: () => resetPreferencesMutation.mutate(),
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isUpdatingPreferences: setPreferenceMutation.isPending || 
                           removePreferenceMutation.isPending || 
                           resetPreferencesMutation.isPending,
  };
}
