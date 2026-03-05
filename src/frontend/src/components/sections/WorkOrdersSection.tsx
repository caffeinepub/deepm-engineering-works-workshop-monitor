import PhotoUploader from "@/components/forms/PhotoUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { WorkOrder } from "@/lib/types";
import { downloadWeekFolder } from "@/utils/downloadWeekFolder";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  User,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCurrentWeekLabel(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  );
  const month = now.toLocaleString("en", { month: "short" });
  return `Week ${weekNo} - ${month} ${now.getFullYear()}`;
}

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "On Hold"];
const SECTION_OPTIONS = [
  "Containers",
  "Cabins",
  "Painting",
  "Parking",
  "Underparts",
  "Delivery",
];

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "In Progress":
      return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "Completed":
      return "bg-green-500/15 text-green-500 border-green-500/30";
    case "On Hold":
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkOrdersSectionProps {
  data: WorkOrder[];
  loading: boolean;
  error: Error | null;
  isReadOnly?: boolean;
  onInsert?: (
    data: Omit<WorkOrder, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
    },
  ) => Promise<void>;
  onUpdate?: (
    id: string,
    data: Partial<WorkOrder> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// ─── Work Order Form Modal ───────────────────────────────────────────────────

interface WorkOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<WorkOrder, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: WorkOrder | null;
}

function WorkOrderForm({
  open,
  onClose,
  onSubmit,
  initial,
}: WorkOrderFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [section, setSection] = useState(initial?.section || "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [assignedTeam, setAssignedTeam] = useState(
    initial?.assigned_team || "",
  );
  const [status, setStatus] = useState(initial?.status || "Pending");
  const [weekLabel, setWeekLabel] = useState(
    initial?.week_label || getCurrentWeekLabel(),
  );
  const [expectedDate, setExpectedDate] = useState(
    initial?.expected_date || "",
  );
  const [description, setDescription] = useState(initial?.description || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setSection(initial.section || "");
      setCustomerName(initial.customer_name || "");
      setAssignedTeam(initial.assigned_team || "");
      setStatus(initial.status || "Pending");
      setWeekLabel(initial.week_label || getCurrentWeekLabel());
      setExpectedDate(initial.expected_date || "");
      setDescription(initial.description || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setTitle("");
      setSection("");
      setCustomerName("");
      setAssignedTeam("");
      setStatus("Pending");
      setWeekLabel(getCurrentWeekLabel());
      setExpectedDate("");
      setDescription("");
      setNotes("");
      setKeptPhotoUrls([]);
    }
    setNewFiles([]);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!section) {
      toast.error("Section is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        section,
        customer_name: customerName,
        assigned_team: assignedTeam,
        status,
        week_label: weekLabel,
        expected_date: expectedDate,
        description,
        notes,
        photos: keptPhotoUrls,
        photoFiles: newFiles,
        keptPhotoUrls,
      });
      onClose();
    } catch {
      toast.error("Failed to save work order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg w-[95vw] max-h-[95dvh] overflow-y-auto"
        data-ocid="workorder.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Work Order" : "New Work Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              className="h-11 text-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Container Fabrication - Kumar"
              required
              data-ocid="workorder.input"
            />
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label>Section *</Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="h-11" data-ocid="workorder.select">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTION_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label>Customer Name</Label>
            <Input
              className="h-11 text-base"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Kumar Transports"
            />
          </div>

          {/* Assigned Team */}
          <div className="space-y-1.5">
            <Label>Assigned Team</Label>
            <Input
              className="h-11 text-base"
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              placeholder="e.g. Team Alpha"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week Label */}
          <div className="space-y-1.5">
            <Label>Week Label</Label>
            <Input
              className="h-11 text-base"
              value={weekLabel}
              onChange={(e) => setWeekLabel(e.target.value)}
              placeholder={getCurrentWeekLabel()}
            />
          </div>

          {/* Expected Date */}
          <div className="space-y-1.5">
            <Label>Expected Date</Label>
            <Input
              type="date"
              className="h-11 text-base"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              className="text-base resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work order..."
              data-ocid="workorder.textarea"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              className="text-base resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          {/* Photos */}
          <div className="space-y-1.5">
            <Label>Photos</Label>
            <PhotoUploader
              existingPhotoUrls={keptPhotoUrls}
              onFilesChange={setNewFiles}
              onRemoveExisting={(url) =>
                setKeptPhotoUrls((prev) => prev.filter((u) => u !== url))
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={onClose}
              data-ocid="workorder.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-[oklch(0.55_0.2_195)] hover:bg-[oklch(0.48_0.2_195)] text-white"
              disabled={submitting}
              data-ocid="workorder.submit_button"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initial ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Work Order Card ─────────────────────────────────────────────────────────

interface WorkOrderCardProps {
  order: WorkOrder;
  index: number;
  isReadOnly: boolean;
  onEdit?: (order: WorkOrder) => void;
  onDelete?: (id: string) => void;
}

function WorkOrderCard({
  order,
  index,
  isReadOnly,
  onEdit,
  onDelete,
}: WorkOrderCardProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  const MAX_VISIBLE_THUMBS = 4;
  const visiblePhotos = order.photos.slice(0, MAX_VISIBLE_THUMBS);
  const overflowCount = Math.max(0, order.photos.length - MAX_VISIBLE_THUMBS);

  return (
    <>
      <div
        className="rounded-lg border border-[oklch(0.55_0.2_195_/_0.25)] bg-card overflow-hidden hover:shadow-md transition-all duration-200"
        data-ocid={`workorder.item.${index}`}
      >
        {/* Card header */}
        <div className="px-4 py-3 bg-[oklch(0.55_0.2_195_/_0.08)]">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground break-words leading-snug">
                {order.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 bg-[oklch(0.55_0.2_195_/_0.1)] text-[oklch(0.55_0.2_195)] border-[oklch(0.55_0.2_195_/_0.3)]"
                >
                  {order.section}
                </Badge>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 h-5 flex-shrink-0 ${statusBadgeClass(order.status)}`}
            >
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-2.5">
          {/* Customer */}
          {order.customer_name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground break-words">
                {order.customer_name}
              </span>
            </div>
          )}

          {/* Assigned Team */}
          {order.assigned_team && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground break-words">
                {order.assigned_team}
              </span>
            </div>
          )}

          {/* Expected Date */}
          {order.expected_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Due:{" "}
                {new Date(order.expected_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Description */}
          {order.description && (
            <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed break-words">
              {order.description}
            </p>
          )}

          {/* Notes */}
          {order.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words">
              {order.notes}
            </p>
          )}

          {/* Photo thumbnails */}
          {order.photos.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {visiblePhotos.map((photo, i) => (
                  <button
                    key={`photo-${i}-${photo.slice(-8)}`}
                    type="button"
                    className="relative group w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setLightboxUrl(photo)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img
                      src={photo}
                      alt={`Attachment ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
                {overflowCount > 0 && (
                  <button
                    type="button"
                    className="w-16 h-16 rounded-md bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors flex-shrink-0 cursor-pointer"
                    onClick={() =>
                      order.photos[MAX_VISIBLE_THUMBS] &&
                      setLightboxUrl(order.photos[MAX_VISIBLE_THUMBS])
                    }
                    aria-label={`View ${overflowCount} more photos`}
                  >
                    +{overflowCount}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isReadOnly && (onEdit || onDelete) && (
            <div className="flex items-center gap-2 pt-1">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs flex-1 min-w-0"
                  onClick={() => onEdit(order)}
                  data-ocid={`workorder.edit_button.${index}`}
                >
                  <Edit2 className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 flex-shrink-0"
                  onClick={() => onDelete(order.id)}
                  data-ocid={`workorder.delete_button.${index}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox — always mounted, toggled via opacity/pointer-events */}
      <button
        type="button"
        tabIndex={lightboxUrl ? 0 : -1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150"
        style={{
          background: "rgba(0,0,0,0.85)",
          opacity: lightboxUrl ? 1 : 0,
          pointerEvents: lightboxUrl ? "auto" : "none",
          willChange: "opacity",
        }}
        onClick={closeLightbox}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") closeLightbox();
        }}
        aria-label="Close lightbox"
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper, keyboard close handled by parent button */}
        <div
          className="relative max-w-[90vw] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
          style={{ willChange: "transform" }}
        >
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
              loading="lazy"
              decoding="async"
            />
          )}
          <span
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
            aria-hidden="true"
          >
            <X className="w-4 h-4" />
          </span>
        </div>
      </button>
    </>
  );
}

// ─── Week Group (collapsible) ────────────────────────────────────────────────

interface WeekGroupProps {
  weekLabel: string;
  orders: WorkOrder[];
  allOrders: WorkOrder[];
  isReadOnly: boolean;
  onEdit?: (order: WorkOrder) => void;
  onDelete?: (id: string) => void;
  defaultOpen?: boolean;
}

function WeekGroup({
  weekLabel,
  orders,
  allOrders,
  isReadOnly,
  onEdit,
  onDelete,
  defaultOpen = false,
}: WeekGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadWeekFolder(weekLabel, allOrders);
      toast.success(`Downloaded ${weekLabel}`);
    } catch {
      toast.error("Failed to generate ZIP");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Week header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[oklch(0.55_0.2_195_/_0.05)] border-b border-border">
        <button
          type="button"
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          data-ocid="workorder.toggle"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ClipboardList className="w-4 h-4 text-[oklch(0.55_0.2_195)] flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground truncate">
              {weekLabel}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 bg-[oklch(0.55_0.2_195_/_0.1)] text-[oklch(0.55_0.2_195)] border-[oklch(0.55_0.2_195_/_0.3)] flex-shrink-0"
            >
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <span className="flex-shrink-0 text-muted-foreground">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {/* Download button — always visible */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs flex-shrink-0 border-[oklch(0.55_0.2_195_/_0.4)] text-[oklch(0.55_0.2_195)] hover:bg-[oklch(0.55_0.2_195_/_0.1)]"
          onClick={handleDownload}
          disabled={downloading}
          data-ocid="workorder.primary_button"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1.5" />
          )}
          {downloading ? "Preparing…" : "Download"}
        </Button>
      </div>

      {/* Collapsible content */}
      {open && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order, idx) => (
              <WorkOrderCard
                key={order.id}
                order={order}
                index={idx + 1}
                isReadOnly={isReadOnly}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function WorkOrdersSection({
  data,
  loading,
  error,
  isReadOnly = false,
  onInsert,
  onUpdate,
  onDelete,
}: WorkOrdersSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<WorkOrder | null>(null);

  const handleEdit = (order: WorkOrder) => {
    setEditRecord(order);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!window.confirm("Delete this work order?")) return;
    try {
      await onDelete(id);
      toast.success("Work order deleted");
    } catch {
      toast.error("Failed to delete work order");
    }
  };

  const handleFormSubmit = async (
    formData: Omit<WorkOrder, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (editRecord && onUpdate) {
      await onUpdate(editRecord.id, formData);
      toast.success("Work order updated");
    } else if (onInsert) {
      await onInsert(formData);
      toast.success("Work order created");
    }
  };

  // Group by week label, most recent first (stable order)
  const weekGroups = (() => {
    const map = new Map<string, WorkOrder[]>();
    for (const order of data) {
      const wl = order.week_label || "Unassigned";
      if (!map.has(wl)) map.set(wl, []);
      map.get(wl)!.push(order);
    }
    // Sort: current week first, then by descending week number if parseable
    return Array.from(map.entries()).sort(([a], [b]) => {
      const current = getCurrentWeekLabel();
      if (a === current) return -1;
      if (b === current) return 1;
      return b.localeCompare(a);
    });
  })();

  if (error) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="workorder.error_state"
      >
        <p>Error loading work orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            className="h-11 bg-[oklch(0.55_0.2_195)] hover:bg-[oklch(0.48_0.2_195)] text-white"
            onClick={() => {
              setEditRecord(null);
              setFormOpen(true);
            }}
            data-ocid="workorder.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Work Order
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <div className="space-y-4" data-ocid="workorder.loading_state">
          {["skel-1", "skel-2"].map((key) => (
            <div
              key={key}
              className="rounded-lg border border-border overflow-hidden"
            >
              <Skeleton className="h-14 rounded-none" />
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-52 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        /* Empty state */
        <div
          className="text-center py-16 space-y-3"
          data-ocid="workorder.empty_state"
        >
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground text-sm">No work orders yet.</p>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditRecord(null);
                setFormOpen(true);
              }}
            >
              Add first work order
            </Button>
          )}
        </div>
      ) : (
        /* Week groups */
        <div className="space-y-4">
          {weekGroups.map(([weekLabel, orders], groupIdx) => (
            <WeekGroup
              key={weekLabel}
              weekLabel={weekLabel}
              orders={orders}
              allOrders={data}
              isReadOnly={isReadOnly}
              onEdit={!isReadOnly ? handleEdit : undefined}
              onDelete={!isReadOnly ? handleDelete : undefined}
              defaultOpen={groupIdx === 0}
            />
          ))}
        </div>
      )}

      {/* Form modal (manager only) */}
      {!isReadOnly && (
        <WorkOrderForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditRecord(null);
          }}
          onSubmit={handleFormSubmit}
          initial={editRecord}
        />
      )}
    </div>
  );
}
