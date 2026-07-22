import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCreatePlace,
  adminDeletePlace,
  adminGetPlace,
  adminListPlaces,
  adminUpdatePlace,
  type PlaceInsert,
  type PlaceRow,
  type PlaceUpdate,
} from "@/lib/services/places-admin";
import { supabase } from "@/integrations/supabase/client";

export function useAdminSession() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Failed to load session:", error);
        }

        if (mounted) {
          setSignedIn(!!session);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setSignedIn(false);
          setLoading(false);
        }
      }
    }

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSignedIn(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    signedIn,
  };
}

export function useAdminPlaces() {
  return useQuery({
    queryKey: ["admin", "places"],
    queryFn: adminListPlaces,
  });
}

export function useAdminPlace(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "places", id],
    queryFn: () => adminGetPlace(id!),
    enabled: !!id,
  });
}

export function useCreatePlace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceInsert) => adminCreatePlace(input),
    onSuccess: (row: PlaceRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
      qc.invalidateQueries({ queryKey: ["places"] });
      qc.setQueryData(["admin", "places", row.id], row);
    },
  });
}

export function useUpdatePlace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceUpdate }) => adminUpdatePlace(id, patch),

    onSuccess: (row: PlaceRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
      qc.invalidateQueries({ queryKey: ["places"] });
      qc.setQueryData(["admin", "places", row.id], row);
    },
  });
}

export function useDeletePlace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDeletePlace(id),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
      qc.invalidateQueries({ queryKey: ["places"] });
    },
  });
}
