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
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkRole(uid: string | null) {
      if (!uid) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        console.error("Failed to load role:", error);
        return false;
      }
      return !!data;
    }

    async function initialise() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      const admin = await checkRole(uid);
      if (mounted) {
        setSignedIn(!!session);
        setUserId(uid);
        setIsAdmin(admin);
        setLoading(false);
      }
    }

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      const admin = await checkRole(uid);
      if (mounted) {
        setSignedIn(!!session);
        setUserId(uid);
        setIsAdmin(admin);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { loading, signedIn, isAdmin, userId };
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
