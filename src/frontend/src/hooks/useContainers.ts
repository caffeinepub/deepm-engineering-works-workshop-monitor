import { useActor } from "@/hooks/useActor";
import type { Container } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapContainerRaw(raw: {
  id: bigint;
  customerName: string;
  containerType: string;
  stage: string;
  teamLeader: string;
  notes: string;
  expectedDate: string;
  createdAt: bigint;
  updatedAt: bigint;
  photos?: unknown[];
}): Omit<Container, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    customer_name: raw.customerName,
    container_type: raw.containerType,
    stage: raw.stage,
    team_leader: raw.teamLeader,
    notes: raw.notes,
    expected_date: raw.expectedDate,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    updated_at: raw.updatedAt.toString(),
  };
}

export function useContainers() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getContainers();
        const rawItems = result.map(mapContainerRaw).reverse();

        // Resolve photos asynchronously for all items
        const items: Container[] = await Promise.all(
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
    item: Omit<Container, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    const id = await actor.addContainer({
      customerName: item.customer_name,
      containerType: item.container_type,
      stage: item.stage,
      teamLeader: item.team_leader,
      notes: item.notes,
      expectedDate: item.expected_date,
      photos: photoBytes,
    });
    await refetch();
    return id;
  };

  const update = async (
    id: string,
    item: Partial<Container> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const current = data.find((r) => r.id === id);
    if (!current) throw new Error("Record not found");
    const merged = { ...current, ...item };

    // Only upload new files; kept photos already stored on backend
    const newBytes = await uploadPhotoFiles(item.photoFiles || []);

    await actor.updateContainer(BigInt(id), {
      customerName: merged.customer_name,
      containerType: merged.container_type,
      stage: merged.stage,
      teamLeader: merged.team_leader,
      notes: merged.notes,
      expectedDate: merged.expected_date,
      photos: newBytes,
    });
    await refetch();
  };

  const remove = async (id: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.deleteContainer(BigInt(id));
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return { data, loading, error, refetch, insert, update, remove };
}
