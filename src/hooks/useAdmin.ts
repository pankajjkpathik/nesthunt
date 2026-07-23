import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminBulkDelete,
  adminBulkUpdateStatus,
  adminCreatePlace,
  adminDeletePlace,
  adminDuplicatePlace,
  adminGetPlace,
  adminListPlaces,
  adminUpdatePlace,
  type PlaceInsert,
  type PlaceRow,
  type PlaceStatus,
  type PlaceUpdate,
} from "@/lib/services/places-admin";


import { supabase } from "@/integrations/supabase/client";

export function useAdminSession() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function loadSession() {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSignedIn(false);
        setIsAdmin(false);
        setUserId(null);
        return;
      }

      const uid = session.user.id;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Failed to load admin role:", error);
      }

      setSignedIn(true);
      setUserId(uid);
      setIsAdmin(Boolean(data));
    } catch (err) {
      console.error("Failed to initialize admin session:", err);

      setSignedIn(false);
      setIsAdmin(false);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queueMicrotask(() => {
        void loadSession();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    signedIn,
    isAdmin,
    userId,
    refresh: loadSession,
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
      qc.invalidateQueries({
        queryKey: ["admin", "places"],
      });

      qc.invalidateQueries({
        queryKey: ["places"],
      });

      qc.setQueryData(["admin", "places", row.id], row);
    },
  });
}

export function useUpdatePlace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceUpdate }) => adminUpdatePlace(id, patch),

    onSuccess: (row: PlaceRow) => {
      qc.invalidateQueries({
        queryKey: ["admin", "places"],
      });

      qc.invalidateQueries({
        queryKey: ["places"],
      });

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

export function useDuplicatePlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDuplicatePlace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
    },
  });
}

export function useBulkUpdatePlaceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: PlaceStatus }) =>
      adminBulkUpdateStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
      qc.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

export function useBulkDeletePlaces() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminBulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "places"] });
      qc.invalidateQueries({ queryKey: ["places"] });
    },
  });
}

