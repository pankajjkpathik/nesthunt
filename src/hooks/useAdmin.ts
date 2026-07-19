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
import { isAdminSession } from "@/lib/admin/auth";

export function useAdminSession() {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  useEffect(() => {
    const sync = () => setSignedIn(isAdminSession());
    sync();
    window.addEventListener("nesthunt-admin-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nesthunt-admin-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return signedIn;
}

export function useAdminPlaces() {
  return useQuery({ queryKey: ["admin", "places"], queryFn: adminListPlaces });
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
