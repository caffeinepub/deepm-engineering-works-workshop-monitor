import { useActor } from "@/hooks/useActor";
import type { Cabin } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapCabinRaw(raw: {
  id: bigint;
  teamNo: string;
  cabinType: string;
  stage: string;
  startDate: string;
  expectedDate: string;
  notes: string;
  createdAt: bigint;
  updatedAt: bigint;
  photos?: unknown[];
}): Omit<Cabin, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    team_no: raw.teamNo,
    cabin_type: raw.cabinType,
    stage: raw.stage,
    start_date: raw.startDate,
    expected_date: raw.expectedDate,
    notes: raw.notes,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    updated_at: raw.updatedAt.toString(),
  };
}

export function useCabins() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!actor) return;
    try {
      setLoading(true);
      const result = await actor.getCabins();
      const rawItems = result.map(mapCabinRaw).reverse();

      const items: Cabin[] = await Promise.all(
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
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!actor || isFetching) return;
    refetch();
    const interval = setInterval(refetch, 20000);
    return () => clearInterval(interval);
  }, [actor, isFetching, refetch]);

  const insert = async (
    item: Omit<Cabin, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    const id = await actor.addCabin({
      teamNo: item.team_no,
      cabinType: item.cabin_type,
      stage: item.stage,
      startDate: item.start_date,
      expectedDate: item.expected_date,
      notes: item.notes,
      photos: photoBytes,
    });
    await refetch();
    return id;
  };

  const update = async (
    id: string,
    item: Partial<Cabin> & { photoFiles?: File[]; keptPhotoUrls?: string[] },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const current = data.find((r) => r.id === id);
    if (!current) throw new Error("Record not found");
    const merged = { ...current, ...item };

    const newBytes = await uploadPhotoFiles(item.photoFiles || []);

    await actor.updateCabin(BigInt(id), {
      teamNo: merged.team_no,
      cabinType: merged.cabin_type,
      stage: merged.stage,
      startDate: merged.start_date,
      expectedDate: merged.expected_date,
      notes: merged.notes,
      photos: newBytes,
    });
    await refetch();
  };

  const remove = async (id: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.deleteCabin(BigInt(id));
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return { data, loading, error, refetch, insert, update, remove };
}
