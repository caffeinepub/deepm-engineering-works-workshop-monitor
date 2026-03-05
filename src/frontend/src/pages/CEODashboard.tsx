import SummaryStats from "@/components/dashboard/SummaryStats";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDailyUpdates } from "@/hooks/useDailyUpdates";
import { useMonthlyArchives } from "@/hooks/useMonthlyArchives";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useWeeklyReports } from "@/hooks/useWeeklyReports";
import { getStoredSession } from "@/lib/auth";
import type { DailyUpdate, WeeklyReport } from "@/lib/types";
import {
  downloadMonthlyReport,
  downloadWeeklyReport,
} from "@/utils/downloadReports";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Archive,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SECTION_CSS: Record<string, string> = {
  Container: "bg-orange-950 text-orange-300 border-orange-800",
  Cabin: "bg-blue-950 text-blue-300 border-blue-800",
  Painting: "bg-yellow-950 text-yellow-300 border-yellow-800",
  Parking: "bg-green-950 text-green-300 border-green-800",
  Underparts: "bg-amber-950 text-amber-300 border-amber-800",
  Delivery: "bg-purple-950 text-purple-300 border-purple-800",
};

// ---------- helpers ----------

function computeMonthLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getFullYear()}_${MONTH_NAMES[d.getMonth()]}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTimestamp(createdAt: string): string {
  const num = Number(createdAt);
  if (!Number.isNaN(num) && num > 0) {
    const ms = num > 1e12 ? Math.floor(num / 1e6) : num;
    return new Date(ms).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return "";
}

// ---------- sub-components ----------

function DailyUpdateCard({ update }: { update: DailyUpdate }) {
  const isMorning = update.shiftType === "Morning";
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isMorning ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-indigo-950 text-indigo-300 border-indigo-800"}`}
          >
            {isMorning ? (
              <Sun className="w-3 h-3" />
            ) : (
              <Moon className="w-3 h-3" />
            )}
            {update.shiftType}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${SECTION_CSS[update.section] ?? "bg-muted text-muted-foreground border-border"}`}
          >
            {update.section}
          </span>
          {update.delays.trim() && (
            <Badge
              variant="destructive"
              className="text-xs gap-1 h-auto py-0.5"
            >
              <AlertCircle className="w-3 h-3" />
              Delay
            </Badge>
          )}
          {formatTimestamp(update.created_at) && (
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {formatTimestamp(update.created_at)}
            </span>
          )}
        </div>
        {update.work_done && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
              Work Done
            </p>
            <p className="text-sm text-foreground">{update.work_done}</p>
          </div>
        )}
        {update.stage_progress && (
          <p className="text-sm text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">
              Stage:{" "}
            </span>
            {update.stage_progress}
          </p>
        )}
        {update.delays.trim() && (
          <p className="text-sm text-red-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              Delays:{" "}
            </span>
            {update.delays}
          </p>
        )}
        {update.notes && (
          <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
            {update.notes}
          </p>
        )}
        {update.photos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {update.photos.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightboxSrc(url)}
                className="relative group"
                aria-label={`View photo ${i + 1}`}
              >
                <img
                  src={url}
                  alt=""
                  className="w-14 h-14 object-cover rounded-md border border-border hover:border-primary/50 transition-colors"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightboxSrc(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setLightboxSrc(null);
            }}
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper, keyboard close handled by parent */}
            <img
              src={lightboxSrc}
              alt="Full view"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------- Live Dashboard Panel ----------

function LiveDashboardTab() {
  const { containers, cabins, painting, parking, underparts, delivery } =
    useRealtimeSync();
  const { data: dailyUpdates, loading: duLoading } = useDailyUpdates();
  const [filterDate, setFilterDate] = useState(getTodayStr());
  const [filterSection, setFilterSection] = useState("All");
  const [filterShift, setFilterShift] = useState("All");

  const filteredUpdates = dailyUpdates.filter((u) => {
    if (u.date !== filterDate) return false;
    if (filterSection !== "All" && u.section !== filterSection) return false;
    if (filterShift !== "All" && u.shiftType !== filterShift) return false;
    return true;
  });

  const morningUpdates = filteredUpdates.filter(
    (u) => u.shiftType === "Morning",
  );
  const eveningUpdates = filteredUpdates.filter(
    (u) => u.shiftType === "Evening",
  );

  return (
    <div className="space-y-8">
      <SummaryStats
        containers={containers.data}
        cabins={cabins.data}
        painting={painting.data}
        parking={parking.data}
        underparts={underparts.data}
        deliveries={delivery.data}
      />

      {/* Daily Updates panel */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground">Daily Updates</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {filteredUpdates.length} update
            {filteredUpdates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center p-3 bg-card rounded-lg border border-border">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            data-ocid="ceo.daily_filter.date.input"
          />
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none"
            data-ocid="ceo.daily_filter.section.select"
          >
            <option value="All">All Sections</option>
            <option value="Container">Container</option>
            <option value="Cabin">Cabin</option>
            <option value="Painting">Painting</option>
            <option value="Parking">Parking</option>
            <option value="Underparts">Underparts</option>
            <option value="Delivery">Delivery</option>
          </select>
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>
        </div>

        {duLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div
            className="text-center py-10 border border-dashed border-border rounded-xl"
            data-ocid="daily_updates.empty_state"
          >
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto opacity-30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No updates found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {morningUpdates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                    Morning ({morningUpdates.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {morningUpdates.map((u) => (
                    <DailyUpdateCard key={u.id} update={u} />
                  ))}
                </div>
              </div>
            )}
            {eveningUpdates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                    Evening ({eveningUpdates.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eveningUpdates.map((u) => (
                    <DailyUpdateCard key={u.id} update={u} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Weekly Archive Tab ----------

interface WeekFolderProps {
  weekLabel: string;
  report?: WeeklyReport;
  updates: DailyUpdate[];
  index: number;
  onArchive: (weekLabel: string) => Promise<void>;
}

function WeekFolder({
  weekLabel,
  report,
  updates,
  index,
  onArchive,
}: WeekFolderProps) {
  const weekUpdates = updates.filter((u) => u.week_label === weekLabel);
  const [open, setOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      downloadWeeklyReport(weekLabel, updates, report);
    } finally {
      setDownloading(false);
    }
  };

  const handleArchive = async () => {
    if (
      !window.confirm(
        `Archive week "${weekLabel}"? This will move it to weekly archive status.`,
      )
    )
      return;
    setArchiving(true);
    try {
      await onArchive(weekLabel);
    } finally {
      setArchiving(false);
    }
  };

  const statusText =
    report?.status ?? (weekUpdates.length > 0 ? "active" : "empty");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      data-ocid={`weekly_archive.folder.item.${index + 1}`}
    >
      {/* Folder header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center flex-shrink-0">
          {open ? (
            <FolderOpen className="w-5 h-5 text-amber-400" />
          ) : (
            <Folder className="w-5 h-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{weekLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {report
              ? `${report.week_start} – ${report.week_end}`
              : `${weekUpdates.length} daily update${weekUpdates.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              statusText === "active"
                ? "bg-green-950 text-green-300 border-green-800"
                : statusText === "archived_monthly"
                  ? "bg-gray-800 text-gray-400 border-gray-700"
                  : "bg-orange-950 text-orange-300 border-orange-800"
            }`}
          >
            {statusText === "active"
              ? "Active"
              : statusText === "archived_monthly"
                ? "Archived"
                : "Archived"}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-4">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="gap-2 text-xs"
                  data-ocid={`weekly_archive.download.button.${index + 1}`}
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Download Report
                </Button>
                {statusText === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleArchive}
                    disabled={archiving}
                    className="gap-2 text-xs text-orange-400 border-orange-800 hover:bg-orange-950/40"
                    data-ocid={`weekly_archive.archive.button.${index + 1}`}
                  >
                    {archiving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                    Archive Week
                  </Button>
                )}
              </div>

              {/* Report summaries */}
              {report && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Container", value: report.container_summary },
                    { label: "Cabin", value: report.cabin_summary },
                    { label: "Painting", value: report.painting_summary },
                    { label: "Parking", value: report.parking_summary },
                    { label: "Underparts", value: report.underparts_summary },
                  ].map(
                    ({ label, value }) =>
                      value && (
                        <div
                          key={label}
                          className="p-3 rounded-lg bg-muted/20 border border-border"
                        >
                          <p
                            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                              SECTION_CSS[label]
                                ? SECTION_CSS[label].split(" ")[1]
                                : "text-muted-foreground"
                            }`}
                          >
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {value}
                          </p>
                        </div>
                      ),
                  )}
                  {report.overall_notes && (
                    <div className="col-span-full p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Overall Notes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.overall_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Daily updates list */}
              {weekUpdates.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Daily Updates ({weekUpdates.length})
                  </p>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {weekUpdates.map((u) => (
                      <DailyUpdateCard key={u.id} update={u} />
                    ))}
                  </div>
                </div>
              )}

              {weekUpdates.length === 0 && !report && (
                <p className="text-xs text-muted-foreground italic">
                  No daily updates for this week.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WeeklyArchiveTab() {
  const {
    data: dailyUpdates,
    loading: duLoading,
    archiveForWeek,
  } = useDailyUpdates();
  const {
    data: weeklyReports,
    loading: wrLoading,
    insert: insertWeeklyReport,
  } = useWeeklyReports();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  // Gather all week labels from daily updates + existing weekly reports
  const weekLabelsFromUpdates = Array.from(
    new Set(dailyUpdates.map((u) => u.week_label)),
  );
  const weekLabelsFromReports = weeklyReports.map((r) => r.week_label);
  const allWeekLabels = Array.from(
    new Set([...weekLabelsFromReports, ...weekLabelsFromUpdates]),
  ).sort((a, b) => b.localeCompare(a));

  // Form state for creating a weekly report
  const [formWeekLabel, setFormWeekLabel] = useState("");
  const [formWeekStart, setFormWeekStart] = useState("");
  const [formWeekEnd, setFormWeekEnd] = useState("");
  const [formContainerSummary, setFormContainerSummary] = useState("");
  const [formCabinSummary, setFormCabinSummary] = useState("");
  const [formPaintingSummary, setFormPaintingSummary] = useState("");
  const [formParkingSummary, setFormParkingSummary] = useState("");
  const [formUnderpartsSummary, setFormUnderpartsSummary] = useState("");
  const [formOverallNotes, setFormOverallNotes] = useState("");

  const handleCreateReport = async () => {
    if (!formWeekLabel.trim()) return;
    setSavingReport(true);
    try {
      const weekUpdates = dailyUpdates.filter(
        (u) => u.week_label === formWeekLabel,
      );
      const today = getTodayStr();
      const d = new Date(`${today}T00:00:00`);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const [yearStr, monthName, , weekNumStr] = formWeekLabel.split("_");
      const weekNum = Number.parseInt(weekNumStr || "1", 10);
      const labelYear = yearStr ? Number.parseInt(yearStr, 10) : year;
      const labelMonth = monthName ? MONTH_NAMES.indexOf(monthName) + 1 : month;

      await insertWeeklyReport({
        week_label: formWeekLabel,
        week_start: formWeekStart || today,
        week_end: formWeekEnd || today,
        month_label: computeMonthLabel(formWeekStart || today),
        year: labelYear,
        month: labelMonth,
        week_number: weekNum,
        container_summary: formContainerSummary,
        cabin_summary: formCabinSummary,
        painting_summary: formPaintingSummary,
        parking_summary: formParkingSummary,
        underparts_summary: formUnderpartsSummary,
        overall_notes: formOverallNotes,
        total_updates: weekUpdates.length,
        status: "active",
      });
      setShowCreateForm(false);
      setFormWeekLabel("");
      setFormWeekStart("");
      setFormWeekEnd("");
      setFormContainerSummary("");
      setFormCabinSummary("");
      setFormPaintingSummary("");
      setFormParkingSummary("");
      setFormUnderpartsSummary("");
      setFormOverallNotes("");
    } finally {
      setSavingReport(false);
    }
  };

  if (duLoading || wrLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((k) => (
          <Skeleton key={k} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Work Order Archive
          </h2>
          <p className="text-xs text-muted-foreground">
            {allWeekLabels.length} week folder
            {allWeekLabels.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCreateForm((v) => !v)}
          className="gap-2"
          data-ocid="weekly_archive.create.button"
        >
          <Plus className="w-4 h-4" />
          Create Weekly Report
        </Button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                New Weekly Report
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="wr-week-label"
                    className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                  >
                    Week Label
                  </label>
                  <input
                    id="wr-week-label"
                    type="text"
                    value={formWeekLabel}
                    onChange={(e) => setFormWeekLabel(e.target.value)}
                    placeholder="2026_June_Week_1"
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wr-week-start"
                    className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                  >
                    Week Start
                  </label>
                  <input
                    id="wr-week-start"
                    type="date"
                    value={formWeekStart}
                    onChange={(e) => setFormWeekStart(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wr-week-end"
                    className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                  >
                    Week End
                  </label>
                  <input
                    id="wr-week-end"
                    type="date"
                    value={formWeekEnd}
                    onChange={(e) => setFormWeekEnd(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "wr-container",
                    label: "Container Summary",
                    state: formContainerSummary,
                    setState: setFormContainerSummary,
                  },
                  {
                    id: "wr-cabin",
                    label: "Cabin Summary",
                    state: formCabinSummary,
                    setState: setFormCabinSummary,
                  },
                  {
                    id: "wr-painting",
                    label: "Painting Summary",
                    state: formPaintingSummary,
                    setState: setFormPaintingSummary,
                  },
                  {
                    id: "wr-parking",
                    label: "Parking Summary",
                    state: formParkingSummary,
                    setState: setFormParkingSummary,
                  },
                  {
                    id: "wr-underparts",
                    label: "Underparts Summary",
                    state: formUnderpartsSummary,
                    setState: setFormUnderpartsSummary,
                  },
                ].map(({ id, label, state, setState }) => (
                  <div key={label}>
                    <label
                      htmlFor={id}
                      className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                    >
                      {label}
                    </label>
                    <Textarea
                      id={id}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder={`${label}...`}
                      className="min-h-[56px] resize-none text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label
                    htmlFor="wr-overall-notes"
                    className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                  >
                    Overall Notes
                  </label>
                  <Textarea
                    id="wr-overall-notes"
                    value={formOverallNotes}
                    onChange={(e) => setFormOverallNotes(e.target.value)}
                    placeholder="Overall notes for the week..."
                    className="min-h-[56px] resize-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateReport}
                  disabled={savingReport || !formWeekLabel.trim()}
                  className="gap-2"
                >
                  {savingReport && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {allWeekLabels.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-xl"
          data-ocid="weekly_archive.empty_state"
        >
          <Folder className="w-12 h-12 text-muted-foreground mx-auto opacity-25 mb-3" />
          <p className="text-sm text-muted-foreground">No weekly data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Daily updates will appear here grouped by week.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allWeekLabels.map((weekLabel, idx) => {
            const report = weeklyReports.find(
              (r) => r.week_label === weekLabel,
            );
            return (
              <WeekFolder
                key={weekLabel}
                weekLabel={weekLabel}
                report={report}
                updates={dailyUpdates}
                index={idx}
                onArchive={archiveForWeek}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Monthly Archive Tab ----------

function MonthlyArchiveTab() {
  const { data: weeklyReports, loading: wrLoading } = useWeeklyReports();
  const {
    data: monthlyArchives,
    loading: maLoading,
    insert: insertArchive,
  } = useMonthlyArchives();
  const { data: dailyUpdates, loading: duLoading } = useDailyUpdates();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingArchive, setSavingArchive] = useState(false);
  const [formSummary, setFormSummary] = useState("");

  const selectedMonthLabel = `${selectedYear}_${MONTH_NAMES[selectedMonth]}`;
  const monthWeeklyReports = weeklyReports.filter(
    (r) => r.month_label === selectedMonthLabel,
  );
  const existingArchive = monthlyArchives.find(
    (a) => a.month_label === selectedMonthLabel,
  );
  const monthUpdates = dailyUpdates.filter(
    (u) => u.month_label === selectedMonthLabel,
  );

  const handleDownload = () => {
    downloadMonthlyReport(
      selectedMonthLabel,
      monthlyArchives,
      weeklyReports,
      dailyUpdates,
    );
  };

  const handleCreateArchive = async () => {
    setSavingArchive(true);
    try {
      const weekLabels = monthWeeklyReports.map((r) => r.week_label);
      const totalContainers = monthUpdates.filter(
        (u) => u.section === "Container",
      ).length;
      const totalCabins = monthUpdates.filter(
        (u) => u.section === "Cabin",
      ).length;
      const totalPaintings = monthUpdates.filter(
        (u) => u.section === "Painting",
      ).length;
      const totalParkings = monthUpdates.filter(
        (u) => u.section === "Parking",
      ).length;
      const totalUnderparts = monthUpdates.filter(
        (u) => u.section === "Underparts",
      ).length;
      const totalDelays = monthUpdates.filter((u) => u.delays.trim()).length;

      await insertArchive({
        year: selectedYear,
        month: selectedMonth + 1,
        month_label: selectedMonthLabel,
        week_labels: weekLabels,
        total_containers: totalContainers,
        total_cabins: totalCabins,
        total_paintings: totalPaintings,
        total_parkings: totalParkings,
        total_underparts: totalUnderparts,
        total_delays: totalDelays,
        overall_summary: formSummary,
      });
      setShowCreateForm(false);
      setFormSummary("");
    } finally {
      setSavingArchive(false);
    }
  };

  const loading = wrLoading || maLoading || duLoading;

  return (
    <div className="space-y-6">
      {/* Year + Month selectors */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number.parseInt(e.target.value, 10))
            }
            className="h-9 px-3 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none"
            data-ocid="monthly_archive.year.select"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {MONTH_NAMES.map((m, idx) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonth(idx)}
              className={`h-8 px-3 rounded-md border text-xs font-semibold transition-colors ${
                selectedMonth === idx
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
              data-ocid="monthly_archive.month.select"
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary card if archive exists */}
          {existingArchive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {selectedMonthLabel.replace("_", " ")} Archive
                </h3>
                <span className="text-xs text-muted-foreground">
                  {existingArchive.week_labels.length} weeks
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  {
                    label: "Containers",
                    value: existingArchive.total_containers,
                    color: "text-orange-400",
                  },
                  {
                    label: "Cabins",
                    value: existingArchive.total_cabins,
                    color: "text-blue-400",
                  },
                  {
                    label: "Painting",
                    value: existingArchive.total_paintings,
                    color: "text-yellow-400",
                  },
                  {
                    label: "Parking",
                    value: existingArchive.total_parkings,
                    color: "text-green-400",
                  },
                  {
                    label: "Underparts",
                    value: existingArchive.total_underparts,
                    color: "text-amber-400",
                  },
                  {
                    label: "Delays",
                    value: existingArchive.total_delays,
                    color: "text-red-400",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="text-center p-3 rounded-lg bg-muted/20 border border-border"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {existingArchive.overall_summary && (
                <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
                  {existingArchive.overall_summary}
                </p>
              )}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
              data-ocid="monthly_archive.download.button"
            >
              <Download className="w-4 h-4" />
              Download Monthly Report
            </Button>
            {!existingArchive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateForm((v) => !v)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Monthly Summary
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h3 className="text-sm font-bold">
                    Create Monthly Summary — {selectedMonthLabel}
                  </h3>
                  <div>
                    <label
                      htmlFor="ma-summary"
                      className="text-xs text-muted-foreground uppercase tracking-wider block mb-1"
                    >
                      Overall Summary
                    </label>
                    <Textarea
                      id="ma-summary"
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="Monthly productivity summary..."
                      className="min-h-[80px] resize-none text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Totals will be auto-computed from {monthUpdates.length}{" "}
                    daily updates.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateArchive}
                      disabled={savingArchive}
                      className="gap-2"
                    >
                      {savingArchive && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      Save Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Weekly reports under selected month */}
          {monthWeeklyReports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Weeks in {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              <div className="space-y-3">
                {monthWeeklyReports.map((r, idx) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border bg-card p-4 flex items-center gap-3 flex-wrap"
                    data-ocid={`weekly_archive.folder.item.${idx + 1}`}
                  >
                    <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{r.week_label}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.week_start} – {r.week_end} · {r.total_updates}{" "}
                        updates
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        r.status === "archived_monthly"
                          ? "bg-gray-800 text-gray-400 border-gray-700"
                          : "bg-green-950 text-green-300 border-green-800"
                      }`}
                    >
                      {r.status === "archived_monthly" ? "Archived" : "Active"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadWeeklyReport(r.week_label, dailyUpdates, r)
                      }
                      className="gap-1.5 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthWeeklyReports.length === 0 && monthUpdates.length === 0 && (
            <div
              className="text-center py-12 border border-dashed border-border rounded-xl"
              data-ocid="monthly_archive.empty_state"
            >
              <Archive className="w-10 h-10 text-muted-foreground mx-auto opacity-25 mb-2" />
              <p className="text-sm text-muted-foreground">
                No data for {MONTH_NAMES[selectedMonth]} {selectedYear}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Download Center Tab ----------

function DownloadCenterTab() {
  const { data: weeklyReports, loading: wrLoading } = useWeeklyReports();
  const { data: monthlyArchives, loading: maLoading } = useMonthlyArchives();
  const { data: dailyUpdates } = useDailyUpdates();

  const sortedWeekly = [...weeklyReports].sort((a, b) =>
    b.week_label.localeCompare(a.week_label),
  );
  const sortedMonthly = [...monthlyArchives].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );

  return (
    <div className="space-y-8">
      {/* Weekly Downloads */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center">
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            Weekly Downloads
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {sortedWeekly.length} report{sortedWeekly.length !== 1 ? "s" : ""}
          </span>
        </div>

        {wrLoading ? (
          <div className="space-y-2">
            {[1, 2].map((k) => (
              <Skeleton key={k} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : sortedWeekly.length === 0 ? (
          <div
            className="text-center py-10 border border-dashed border-border rounded-xl"
            data-ocid="download_center.weekly.empty_state"
          >
            <FileText className="w-8 h-8 text-muted-foreground mx-auto opacity-25 mb-2" />
            <p className="text-sm text-muted-foreground">
              No weekly reports yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedWeekly.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-lg border border-border bg-card p-4 flex items-center gap-3 flex-wrap"
              >
                <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.week_label}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.week_start} – {r.week_end} · {r.total_updates} updates
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    r.status === "archived_monthly"
                      ? "bg-gray-800 text-gray-400 border-gray-700"
                      : "bg-green-950 text-green-300 border-green-800"
                  }`}
                >
                  {r.status === "archived_monthly" ? "Archived" : "Active"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadWeeklyReport(r.week_label, dailyUpdates, r)
                  }
                  className="gap-2 text-xs flex-shrink-0"
                  data-ocid={`download_center.weekly.download_button.${idx + 1}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Monthly Downloads */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-800/40 flex items-center justify-center">
            <Archive className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            Monthly Downloads
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {sortedMonthly.length} archive
            {sortedMonthly.length !== 1 ? "s" : ""}
          </span>
        </div>

        {maLoading ? (
          <div className="space-y-2">
            {[1, 2].map((k) => (
              <Skeleton key={k} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : sortedMonthly.length === 0 ? (
          <div
            className="text-center py-10 border border-dashed border-border rounded-xl"
            data-ocid="download_center.monthly.empty_state"
          >
            <Archive className="w-8 h-8 text-muted-foreground mx-auto opacity-25 mb-2" />
            <p className="text-sm text-muted-foreground">
              No monthly archives yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMonthly.map((a, idx) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-lg border border-border bg-card p-4 flex items-center gap-3 flex-wrap"
              >
                <Archive className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {a.month_label.replace("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.week_labels.length} week
                    {a.week_labels.length !== 1 ? "s" : ""} ·{" "}
                    {a.total_containers +
                      a.total_cabins +
                      a.total_paintings +
                      a.total_parkings +
                      a.total_underparts}{" "}
                    section updates
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadMonthlyReport(
                      a.month_label,
                      monthlyArchives,
                      weeklyReports,
                      dailyUpdates,
                    )
                  }
                  className="gap-2 text-xs flex-shrink-0"
                  data-ocid={`download_center.monthly.download_button.${idx + 1}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- Main CEO Dashboard ----------

export default function CEODashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = useCallback((d: Date) => {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }, []);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      void navigate({ to: "/" });
      return;
    }
    setEmail(session.email);
    setAuthChecked(true);
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userRole="ceo" email={email} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
          <div>
            <h1 className="text-xl font-bold text-foreground">CEO Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time workshop status — auto-refreshes every 30 seconds
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {formatTime(lastUpdated)}
            </span>
          </div>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <div className="overflow-x-auto mb-6">
            <TabsList className="h-auto p-1 flex flex-nowrap gap-1 bg-card border border-border w-max min-w-full">
              <TabsTrigger
                value="live"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                data-ocid="ceo.live_dashboard.tab"
              >
                <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Live Dashboard
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-amber-900/20 data-[state=active]:text-amber-400"
                data-ocid="ceo.weekly_archive.tab"
              >
                <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5" />
                  Weekly Archive
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-400"
                data-ocid="ceo.monthly_archive.tab"
              >
                <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Archive className="w-3.5 h-3.5" />
                  Monthly Archive
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="downloads"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-green-900/20 data-[state=active]:text-green-400"
                data-ocid="ceo.download_center.tab"
              >
                <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Download Center
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="live">
            <LiveDashboardTab />
          </TabsContent>
          <TabsContent value="weekly">
            <WeeklyArchiveTab />
          </TabsContent>
          <TabsContent value="monthly">
            <MonthlyArchiveTab />
          </TabsContent>
          <TabsContent value="downloads">
            <DownloadCenterTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
