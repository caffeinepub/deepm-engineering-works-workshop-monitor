import { useActor } from "@/hooks/useActor";
import type { Painting } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapPaintingRaw(raw: {
  id: bigint;
  customerName: string;
  teamNo: string;
  interiorColour: string;
  exteriorColour: string;
  stage: string;
  expectedDate: string;
  notes: string;
  createdAt: bigint;
  updatedAt: bigint;
  photos?: unknown[];
}): Omit<Painting, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    customer_name: raw.customerName,
    team_no: raw.teamNo,
    interior_colour: raw.interiorColour,
    exterior_colour: raw.exteriorColour,
    stage: raw.stage,
    expected_date: raw.expectedDate,
    notes: raw.notes,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    updated_at: raw.updatedAt.toString(),
  };
}

export function usePainting() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!actor) return;
    try {
      setLoading(true);
      const result = await actor.getPaintings();
      const rawItems = result.map(mapPaintingRaw).reverse();

      const items: Painting[] = await Promise.all(
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
    item: Omit<Painting, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    const id = await actor.addPainting({
      customerName: item.customer_name,
      teamNo: item.team_no,
      interiorColour: item.interior_colour,
      exteriorColour: item.exterior_colour,
      stage: item.stage,
      expectedDate: item.expected_date,
      notes: item.notes,
      photos: photoBytes,
    });
    await refetch();
    return id;
  };

  const update = async (
    id: string,
    item: Partial<Painting> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const current = data.find((r) => r.id === id);
    if (!current) throw new Error("Record not found");
    const merged = { ...current, ...item };

    const newBytes = await uploadPhotoFiles(item.photoFiles || []);

    await actor.updatePainting(BigInt(id), {
      customerName: merged.customer_name,
      teamNo: merged.team_no,
      interiorColour: merged.interior_colour,
      exteriorColour: merged.exterior_colour,
      stage: merged.stage,
      expectedDate: merged.expected_date,
      notes: merged.notes,
      photos: newBytes,
    });
    await refetch();
  };

  const remove = async (id: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.deletePainting(BigInt(id));
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return { data, loading, error, refetch, insert, update, remove };
}
