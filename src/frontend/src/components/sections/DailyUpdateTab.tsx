import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDailyUpdates } from "@/hooks/useDailyUpdates";
import type { DailyUpdate } from "@/lib/types";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  ImageIcon,
  Loader2,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

function computeWeekLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDate();
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();
  const weekNum = Math.ceil(day / 7);
  return `${year}_${MONTH_NAMES[month]}_Week_${weekNum}`;
}

function computeMonthLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const month = d.getMonth();
  const year = d.getFullYear();
  return `${year}_${MONTH_NAMES[month]}`;
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

const SECTION_COLORS: Record<string, string> = {
  Container: "bg-orange-950 text-orange-300 border-orange-800",
  Cabin: "bg-blue-950 text-blue-300 border-blue-800",
  Painting: "bg-yellow-950 text-yellow-300 border-yellow-800",
  Parking: "bg-green-950 text-green-300 border-green-800",
  Underparts: "bg-amber-950 text-amber-300 border-amber-800",
  Delivery: "bg-purple-950 text-purple-300 border-purple-800",
};

function DailyUpdateCard({ update }: { update: DailyUpdate }) {
  const isMorning = update.shiftType === "Morning";
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${isMorning ? "bg-amber-950 text-amber-300 border-amber-800" : "bg-indigo-950 text-indigo-300 border-indigo-800"}`}
        >
          {isMorning ? (
            <Sun className="w-3 h-3" />
          ) : (
            <Moon className="w-3 h-3" />
          )}
          {update.shiftType}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SECTION_COLORS[update.section] ?? "bg-muted text-muted-foreground border-border"}`}
        >
          {update.section}
        </span>
        {update.delays.trim() && (
          <Badge variant="destructive" className="text-xs px-2 py-0.5 h-auto">
            <AlertCircle className="w-3 h-3 mr-1" />
            Delay
          </Badge>
        )}
        {formatTimestamp(update.created_at) && (
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(update.created_at)}
          </span>
        )}
      </div>
      {update.work_done && (
        <p className="text-sm text-foreground leading-relaxed">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-0.5">
            Work Done
          </span>
          {update.work_done}
        </p>
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
          <ImageIcon className="w-3.5 h-3.5" />
          {update.photos.length} photo
          {update.photos.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default function DailyUpdateTab() {
  const { data, loading, insert } = useDailyUpdates();
  const [date, setDate] = useState(getTodayStr());
  const [shiftType, setShiftType] = useState<"Morning" | "Evening">("Morning");
  const [section, setSection] = useState("Container");
  const [workDone, setWorkDone] = useState("");
  const [stageProgress, setStageProgress] = useState("");
  const [delays, setDelays] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviewUrls[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) {
      toast.error("Please describe what work was done");
      return;
    }
    setSubmitting(true);
    try {
      await insert({
        date,
        shiftType,
        section,
        work_done: workDone,
        stage_progress: stageProgress,
        delays,
        notes,
        status: "active",
        week_label: computeWeekLabel(date),
        month_label: computeMonthLabel(date),
        photoFiles,
      });
      toast.success("Daily update submitted");
      setWorkDone("");
      setStageProgress("");
      setDelays("");
      setNotes("");
      for (const u of photoPreviewUrls) URL.revokeObjectURL(u);
      setPhotoFiles([]);
      setPhotoPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error("Failed to submit update");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const todayUpdates = data.filter((u) => u.date === date);
  const morningUpdates = todayUpdates.filter((u) => u.shiftType === "Morning");
  const eveningUpdates = todayUpdates.filter((u) => u.shiftType === "Evening");

  return (
    <div className="space-y-8">
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Submit Daily Update
            </h2>
            <p className="text-xs text-muted-foreground">
              Record shift-wise work progress
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date + Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-ocid="daily_update.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Shift Type
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShiftType("Morning")}
                  className={`flex-1 h-10 rounded-md border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${shiftType === "Morning" ? "bg-amber-900/60 border-amber-700 text-amber-300" : "border-border text-muted-foreground hover:border-amber-800 hover:text-amber-400"}`}
                  data-ocid="daily_update.shift.select"
                >
                  <Sun className="w-4 h-4" />
                  Morning
                </button>
                <button
                  type="button"
                  onClick={() => setShiftType("Evening")}
                  className={`flex-1 h-10 rounded-md border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${shiftType === "Evening" ? "bg-indigo-900/60 border-indigo-700 text-indigo-300" : "border-border text-muted-foreground hover:border-indigo-800 hover:text-indigo-400"}`}
                >
                  <Moon className="w-4 h-4" />
                  Evening
                </button>
              </div>
            </div>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Section
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Container",
                "Cabin",
                "Painting",
                "Parking",
                "Underparts",
                "Delivery",
              ].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSection(sec)}
                  className={`h-9 px-4 rounded-md border text-xs font-semibold transition-colors ${section === sec ? (SECTION_COLORS[sec] ?? "bg-muted text-foreground border-border") : "border-border text-muted-foreground hover:border-primary/50"}`}
                  data-ocid="daily_update.section.select"
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Work Done */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Work Done <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="Describe what work was done today..."
              className="min-h-[80px] resize-none text-sm"
              data-ocid="daily_update.work_done.textarea"
            />
          </div>

          {/* Stage Progress */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stage Progress
            </Label>
            <Textarea
              value={stageProgress}
              onChange={(e) => setStageProgress(e.target.value)}
              placeholder="What stage has progressed? (e.g. Welding 60% → 80%)"
              className="min-h-[68px] resize-none text-sm"
              data-ocid="daily_update.stage_progress.textarea"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delays */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Delays / Issues
              </Label>
              <Textarea
                value={delays}
                onChange={(e) => setDelays(e.target.value)}
                placeholder="Any delays or issues..."
                className="min-h-[68px] resize-none text-sm"
                data-ocid="daily_update.delays.textarea"
              />
            </div>
            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional remarks..."
                className="min-h-[68px] resize-none text-sm"
                data-ocid="daily_update.notes.textarea"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Photos
            </Label>
            {photoPreviewUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviewUrls.map((url, idx) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              data-ocid="daily_update.photos.upload_button"
            >
              <Camera className="w-4 h-4" />
              Add Photos
              {photoFiles.length > 0 && (
                <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  {photoFiles.length}
                </span>
              )}
            </Button>
          </div>

          {/* Auto-computed labels info */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
            <span>
              Week:{" "}
              <span className="text-primary font-medium">
                {computeWeekLabel(date)}
              </span>
            </span>
            <span>
              Month:{" "}
              <span className="text-primary font-medium">
                {computeMonthLabel(date)}
              </span>
            </span>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 font-semibold"
            data-ocid="daily_update.submit_button"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Update
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Today's Updates */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">
            Updates for{" "}
            <span className="text-primary">
              {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {todayUpdates.length} update
            {todayUpdates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((k) => (
              <Skeleton key={k} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : todayUpdates.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-xl">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto opacity-30" />
            <p className="text-sm text-muted-foreground">
              No updates yet for this date.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {morningUpdates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                    Morning Updates
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    ({morningUpdates.length})
                  </span>
                </div>
                <div className="space-y-3">
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
                    Evening Updates
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    ({eveningUpdates.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {eveningUpdates.map((u) => (
                    <DailyUpdateCard key={u.id} update={u} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
