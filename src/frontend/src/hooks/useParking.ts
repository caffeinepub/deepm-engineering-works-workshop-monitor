import { useActor } from "@/hooks/useActor";
import type { Parking } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapParkingRaw(raw: {
  id: bigint;
  customerName: string;
  waitingFor: string;
  entryDate: string;
  notes: string;
  createdAt: bigint;
  updatedAt: bigint;
  photos?: unknown[];
}): Omit<Parking, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    customer_name: raw.customerName,
    waiting_for: raw.waitingFor,
    entry_date: raw.entryDate,
    notes: raw.notes,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    updated_at: raw.updatedAt.toString(),
  };
}

export function useParking() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getParkings();
        const rawItems = result.map(mapParkingRaw).reverse();

        const items: Parking[] = await Promise.all(
          rawItems.map(async (item) => {
            const photos = await resolvePhotos(item.rawPhotos);
            return { ...item, photos };
          }),
        );

        setData(items);
        setError(null);
      } catch (e) {
        setError(e as Error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    refetch(true);
    const interval = setInterval(() => refetch(false), 30000);
    return () => clearInterval(interval);
  }, [actor, isFetching, refetch]);

  const insert = async (
    item: Omit<Parking, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    const id = await actor.addParking({
      customerName: item.customer_name,
      waitingFor: item.waiting_for,
      entryDate: item.entry_date,
      notes: item.notes,
      photos: photoBytes,
    });
    await refetch();
    return id;
  };

  const update = async (
    id: string,
    item: Partial<Parking> & { photoFiles?: File[]; keptPhotoUrls?: string[] },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const current = data.find((r) => r.id === id);
    if (!current) throw new Error("Record not found");
    const merged = { ...current, ...item };

    const newBytes = await uploadPhotoFiles(item.photoFiles || []);

    await actor.updateParking(BigInt(id), {
      customerName: merged.customer_name,
      waitingFor: merged.waiting_for,
      entryDate: merged.entry_date,
      notes: merged.notes,
      photos: newBytes,
    });
    await refetch();
  };

  const remove = async (id: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.deleteParking(BigInt(id));
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return { data, loading, error, refetch, insert, update, remove };
}
