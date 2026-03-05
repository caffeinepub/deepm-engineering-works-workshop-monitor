import { useActor } from "@/hooks/useActor";
import type { MonthlyArchive } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function mapMonthlyArchiveRaw(raw: {
  id: bigint;
  weekLabels: string[];
  month: bigint;
  overallSummary: string;
  totalDelays: bigint;
  createdAt: bigint;
  year: bigint;
  monthLabel: string;
  totalUnderparts: bigint;
  totalParkings: bigint;
  totalCabins: bigint;
  totalContainers: bigint;
  totalPaintings: bigint;
}): MonthlyArchive {
  return {
    id: raw.id.toString(),
    year: Number(raw.year),
    month: Number(raw.month),
    month_label: raw.monthLabel,
    week_labels: raw.weekLabels,
    total_containers: Number(raw.totalContainers),
    total_cabins: Number(raw.totalCabins),
    total_paintings: Number(raw.totalPaintings),
    total_parkings: Number(raw.totalParkings),
    total_underparts: Number(raw.totalUnderparts),
    total_delays: Number(raw.totalDelays),
    overall_summary: raw.overallSummary,
    created_at: raw.createdAt.toString(),
  };
}

export function useMonthlyArchives() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<MonthlyArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getMonthlyArchives();
        const items = result.map(mapMonthlyArchiveRaw).reverse();
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

  const insert = async (item: Omit<MonthlyArchive, "id" | "created_at">) => {
    if (!actor) throw new Error("Actor not available");
    await actor.addMonthlyArchive({
      weekLabels: item.week_labels,
      month: BigInt(item.month),
      overallSummary: item.overall_summary,
      totalDelays: BigInt(item.total_delays),
      year: BigInt(item.year),
      monthLabel: item.month_label,
      totalUnderparts: BigInt(item.total_underparts),
      totalParkings: BigInt(item.total_parkings),
      totalCabins: BigInt(item.total_cabins),
      totalContainers: BigInt(item.total_containers),
      totalPaintings: BigInt(item.total_paintings),
    });
    await refetch();
  };

  const update = async (
    id: string,
    item: Omit<MonthlyArchive, "id" | "created_at">,
  ) => {
    if (!actor) throw new Error("Actor not available");
    await actor.updateMonthlyArchive(BigInt(id), {
      weekLabels: item.week_labels,
      month: BigInt(item.month),
      overallSummary: item.overall_summary,
      totalDelays: BigInt(item.total_delays),
      year: BigInt(item.year),
      monthLabel: item.month_label,
      totalUnderparts: BigInt(item.total_underparts),
      totalParkings: BigInt(item.total_parkings),
      totalCabins: BigInt(item.total_cabins),
      totalContainers: BigInt(item.total_containers),
      totalPaintings: BigInt(item.total_paintings),
    });
    await refetch();
  };

  return { data, loading, error, refetch, insert, update };
}
