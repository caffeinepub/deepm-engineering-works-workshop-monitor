import { useActor } from "@/hooks/useActor";
import type { DailyUpdate } from "@/lib/types";
import { resolvePhotos, uploadPhotoFiles } from "@/utils/photoStorage";
import { useCallback, useEffect, useState } from "react";

function mapDailyUpdateRaw(raw: {
  id: bigint;
  status: string;
  date: string;
  createdAt: bigint;
  monthLabel: string;
  section: string;
  delays: string;
  notes: string;
  weekLabel: string;
  shiftType: string;
  stageProgress: string;
  photos?: unknown[];
  workDone: string;
}): Omit<DailyUpdate, "photos"> & { rawPhotos: unknown[] } {
  return {
    id: raw.id.toString(),
    date: raw.date,
    shiftType: raw.shiftType,
    section: raw.section,
    work_done: raw.workDone,
    stage_progress: raw.stageProgress,
    delays: raw.delays,
    notes: raw.notes,
    rawPhotos: raw.photos || [],
    created_at: raw.createdAt.toString(),
    status: raw.status,
    week_label: raw.weekLabel,
    month_label: raw.monthLabel,
  };
}

export function useDailyUpdates() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getDailyUpdates();
        const rawItems = result.map(mapDailyUpdateRaw).reverse();

        const items: DailyUpdate[] = await Promise.all(
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
    item: Omit<DailyUpdate, "id" | "created_at" | "photos"> & {
      photoFiles?: File[];
    },
  ) => {
    if (!actor) throw new Error("Actor not available");
    const photoBytes = await uploadPhotoFiles(item.photoFiles || []);
    await actor.addDailyUpdate({
      status: item.status,
      date: item.date,
      monthLabel: item.month_label,
      section: item.section,
      delays: item.delays,
      notes: item.notes,
      weekLabel: item.week_label,
      shiftType: item.shiftType,
      stageProgress: item.stage_progress,
      photos: photoBytes,
      workDone: item.work_done,
    });
    await refetch();
  };

  const archiveForWeek = async (weekLabel: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.archiveDailyUpdatesForWeek(weekLabel);
    await refetch();
  };

  return { data, loading, error, refetch, insert, archiveForWeek };
}
