import { useActor } from "@/hooks/useActor";
import type { WorkOrder } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapWorkOrderRaw(raw: {
  id: bigint;
  customerName: string;
  status: string;
  title: string;
  createdAt: bigint;
  section: string;
  description: string;
  updatedAt: bigint;
  notes: string;
  assignedTeam: string;
  expectedDate: string;
  weekLabel: string;
  photos?: unknown[];
}): Omit<WorkOrder, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    title: raw.title,
    section: raw.section,
    customer_name: raw.customerName,
    assigned_team: raw.assignedTeam,
    description: raw.description,
    status: raw.status,
    week_label: raw.weekLabel,
    expected_date: raw.expectedDate,
    notes: raw.notes,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    updated_at: raw.updatedAt.toString(),
  };
}

export function useWorkOrders() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getWorkOrders();
        const rawItems = result.map(mapWorkOrderRaw).reverse();

        const items: WorkOrder[] = await Promise.all(
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
    item: Omit<WorkOrder, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    await actor.addWorkOrder({
      customerName: item.customer_name,
      status: item.status,
      title: item.title,
      section: item.section,
      description: item.description,
      notes: item.notes,
      assignedTeam: item.assigned_team,
      expectedDate: item.expected_date,
      weekLabel: item.week_label,
      photos: photoBytes,
    });
    await refetch();
  };

  const update = async (
    id: string,
    item: Partial<WorkOrder> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const current = data.find((r) => r.id === id);
    if (!current) throw new Error("Record not found");
    const merged = { ...current, ...item };

    const newBytes = await uploadPhotoFiles(item.photoFiles || []);

    await actor.updateWorkOrder(BigInt(id), {
      customerName: merged.customer_name,
      status: merged.status,
      title: merged.title,
      section: merged.section,
      description: merged.description,
      notes: merged.notes,
      assignedTeam: merged.assigned_team,
      expectedDate: merged.expected_date,
      weekLabel: merged.week_label,
      photos: newBytes,
    });
    await refetch();
  };

  const remove = async (id: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.deleteWorkOrder(BigInt(id));
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return { data, loading, error, refetch, insert, update, remove };
}
