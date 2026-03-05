import { useActor } from "@/hooks/useActor";
import type { WeeklyReport } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

function mapWeeklyReportRaw(raw: {
  id: bigint;
  status: string;
  paintingSummary: string;
  month: bigint;
  weekEnd: string;
  cabinSummary: string;
  totalUpdates: bigint;
  containerSummary: string;
  createdAt: bigint;
  overallNotes: string;
  underpartsSummary: string;
  year: bigint;
  monthLabel: string;
  weekNumber: bigint;
  parkingSummary: string;
  weekLabel: string;
  weekStart: string;
  archivedAt: bigint;
}): WeeklyReport {
  return {
    id: raw.id.toString(),
    week_label: raw.weekLabel,
    week_start: raw.weekStart,
    week_end: raw.weekEnd,
    month_label: raw.monthLabel,
    year: Number(raw.year),
    month: Number(raw.month),
    week_number: Number(raw.weekNumber),
    container_summary: raw.containerSummary,
    cabin_summary: raw.cabinSummary,
    painting_summary: raw.paintingSummary,
    parking_summary: raw.parkingSummary,
    underparts_summary: raw.underpartsSummary,
    overall_notes: raw.overallNotes,
    total_updates: Number(raw.totalUpdates),
    status: raw.status,
    created_at: raw.createdAt.toString(),
    archived_at: raw.archivedAt.toString(),
  };
}

export function useWeeklyReports() {
  const { actor, isFetching } = useActor();
  const [data, setData] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(
    async (showLoading = false) => {
      if (!actor) return;
      try {
        if (showLoading) setLoading(true);
        const result = await actor.getWeeklyReports();
        const items = result.map(mapWeeklyReportRaw).reverse();
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
    item: Omit<WeeklyReport, "id" | "created_at" | "archived_at">,
  ) => {
    if (!actor) throw new Error("Actor not available");
    await actor.addWeeklyReport({
      status: item.status,
      paintingSummary: item.painting_summary,
      month: BigInt(item.month),
      weekEnd: item.week_end,
      cabinSummary: item.cabin_summary,
      totalUpdates: BigInt(item.total_updates),
      containerSummary: item.container_summary,
      overallNotes: item.overall_notes,
      underpartsSummary: item.underparts_summary,
      year: BigInt(item.year),
      monthLabel: item.month_label,
      weekNumber: BigInt(item.week_number),
      parkingSummary: item.parking_summary,
      weekLabel: item.week_label,
      weekStart: item.week_start,
    });
    await refetch();
  };

  const archiveToMonth = async (weekLabel: string) => {
    if (!actor) throw new Error("Actor not available");
    await actor.archiveWeeklyReportToMonth(weekLabel);
    await refetch();
  };

  return { data, loading, error, refetch, insert, archiveToMonth };
}
