import {
  getCabinProgress,
  getContainerProgress,
  getPaintingProgress,
  isDelayed,
} from "@/lib/progress";
import type {
  Cabin,
  Container,
  Painting,
  Parking,
  Underpart,
} from "@/lib/types";
import {
  AlertTriangle,
  Box,
  Car,
  Layers,
  type LucideIcon,
  Palette,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";

interface SummaryStatsProps {
  containers: Container[];
  cabins: Cabin[];
  painting: Painting[];
  parking: Parking[];
  underparts: Underpart[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  index,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-lg border border-border bg-card p-4 flex flex-col gap-3"
    >
      <div
        className="absolute inset-0 opacity-[0.04] rounded-lg"
        style={{ background: color }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: `${color}22` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span
          className="text-3xl font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground mb-1">active</span>
      </div>
    </motion.div>
  );
}

export default function SummaryStats({
  containers,
  cabins,
  painting,
  parking,
  underparts,
}: SummaryStatsProps) {
  const delayedContainers = containers.filter((c) =>
    isDelayed(c.expected_date, getContainerProgress(c.stage)),
  ).length;
  const delayedCabins = cabins.filter((c) =>
    isDelayed(c.expected_date, getCabinProgress(c.stage)),
  ).length;
  const delayedPainting = painting.filter((p) =>
    isDelayed(p.expected_date, getPaintingProgress(p.stage)),
  ).length;
  const totalDelayed = delayedContainers + delayedCabins + delayedPainting;
  const underpartsPending = underparts.filter(
    (u) => u.work_status === "Not Finished",
  ).length;

  const stats = [
    {
      label: "Containers",
      value: containers.length,
      icon: Box,
      color: "oklch(0.65 0.2 30)",
    },
    {
      label: "Cabins",
      value: cabins.length,
      icon: Layers,
      color: "oklch(0.6 0.2 250)",
    },
    {
      label: "Painting",
      value: painting.length,
      icon: Palette,
      color: "oklch(0.75 0.18 85)",
    },
    {
      label: "Parking",
      value: parking.length,
      icon: Car,
      color: "oklch(0.65 0.18 145)",
    },
    {
      label: "Underparts Pending",
      value: underpartsPending,
      icon: Wrench,
      color: "oklch(0.6 0.15 55)",
    },
    {
      label: "Total Delayed",
      value: totalDelayed,
      icon: AlertTriangle,
      color: "oklch(0.62 0.22 25)",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  );
}
