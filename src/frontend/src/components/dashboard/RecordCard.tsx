import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getCabinProgress,
  getContainerProgress,
  getDaysWaiting,
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
  Calendar,
  Clock,
  Edit2,
  ImageIcon,
  Trash2,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";

type RecordType = "container" | "cabin" | "painting" | "parking" | "underpart";

interface RecordCardProps {
  type: RecordType;
  record: Container | Cabin | Painting | Parking | Underpart;
  onEdit?: (record: Container | Cabin | Painting | Parking | Underpart) => void;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<
  RecordType,
  { color: string; borderColor: string; bgColor: string }
> = {
  container: {
    color: "text-[oklch(0.65_0.2_30)]",
    borderColor: "border-[oklch(0.65_0.2_30_/_0.3)]",
    bgColor: "bg-[oklch(0.65_0.2_30_/_0.08)]",
  },
  cabin: {
    color: "text-[oklch(0.6_0.2_250)]",
    borderColor: "border-[oklch(0.6_0.2_250_/_0.3)]",
    bgColor: "bg-[oklch(0.6_0.2_250_/_0.08)]",
  },
  painting: {
    color: "text-[oklch(0.75_0.18_85)]",
    borderColor: "border-[oklch(0.75_0.18_85_/_0.3)]",
    bgColor: "bg-[oklch(0.75_0.18_85_/_0.08)]",
  },
  parking: {
    color: "text-[oklch(0.65_0.18_145)]",
    borderColor: "border-[oklch(0.65_0.18_145_/_0.3)]",
    bgColor: "bg-[oklch(0.65_0.18_145_/_0.08)]",
  },
  underpart: {
    color: "text-[oklch(0.6_0.15_55)]",
    borderColor: "border-[oklch(0.6_0.15_55_/_0.3)]",
    bgColor: "bg-[oklch(0.6_0.15_55_/_0.08)]",
  },
};

function getProgress(
  type: RecordType,
  record: Container | Cabin | Painting | Parking | Underpart,
): number | null {
  if (type === "container")
    return getContainerProgress((record as Container).stage);
  if (type === "cabin") return getCabinProgress((record as Cabin).stage);
  if (type === "painting")
    return getPaintingProgress((record as Painting).stage);
  return null;
}

function getTitle(
  type: RecordType,
  record: Container | Cabin | Painting | Parking | Underpart,
): string {
  if (type === "cabin") return `Team ${(record as Cabin).team_no}`;
  return (
    (record as Container | Painting | Parking | Underpart).customer_name || "—"
  );
}

function getSubtitle(
  type: RecordType,
  record: Container | Cabin | Painting | Parking | Underpart,
): string {
  if (type === "container")
    return `${(record as Container).container_type} · ${(record as Container).team_leader}`;
  if (type === "cabin") return `${(record as Cabin).cabin_type}`;
  if (type === "painting")
    return `Team ${(record as Painting).team_no} · ${(record as Painting).exterior_colour}`;
  if (type === "parking")
    return `Waiting for: ${(record as Parking).waiting_for}`;
  if (type === "underpart") return `Team: ${(record as Underpart).team_name}`;
  return "";
}

const MAX_VISIBLE_THUMBS = 4;

export default function RecordCard({
  type,
  record,
  onEdit,
  onDelete,
}: RecordCardProps) {
  const config = typeConfig[type];
  const progress = getProgress(type, record);
  const title = getTitle(type, record);
  const subtitle = getSubtitle(type, record);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const hasExpectedDate = "expected_date" in record && record.expected_date;
  const delayed =
    hasExpectedDate && progress !== null
      ? isDelayed(
          (record as Container | Cabin | Painting).expected_date,
          progress,
        )
      : false;

  const isParking = type === "parking";
  const parkingRecord = isParking ? (record as Parking) : null;
  const daysWaiting = parkingRecord
    ? getDaysWaiting(parkingRecord.entry_date)
    : null;
  const parkingOverdue = daysWaiting !== null && daysWaiting > 5;

  const isUnderpart = type === "underpart";
  const underpartRecord = isUnderpart ? (record as Underpart) : null;

  const photos =
    (record as Container | Cabin | Painting | Parking | Underpart).photos || [];
  const visiblePhotos = photos.slice(0, MAX_VISIBLE_THUMBS);
  const overflowCount = Math.max(0, photos.length - MAX_VISIBLE_THUMBS);

  return (
    <>
      <div
        className={`rounded-lg border bg-card overflow-hidden transition-all duration-200 hover:shadow-md ${config.borderColor}`}
      >
        <div className={`px-4 py-3 ${config.bgColor}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground break-words">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
              {delayed && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0.5 h-5"
                >
                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                  Delayed
                </Badge>
              )}
              {parkingOverdue && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0.5 h-5"
                >
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Progress bar for containers/cabins/painting */}
          {progress !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {(record as Container | Cabin | Painting).stage}
                </span>
                <span className={`text-xs font-bold ${config.color}`}>
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Parking info */}
          {isParking && parkingRecord && (
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span
                className={`text-sm font-medium ${parkingOverdue ? "text-destructive" : "text-foreground"}`}
              >
                {daysWaiting} day{daysWaiting !== 1 ? "s" : ""} waiting
              </span>
              {parkingRecord.entry_date && (
                <span className="text-xs text-muted-foreground">
                  (entered{" "}
                  {new Date(parkingRecord.entry_date).toLocaleDateString()})
                </span>
              )}
            </div>
          )}

          {/* Underpart status */}
          {isUnderpart && underpartRecord && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  underpartRecord.work_status === "Finished"
                    ? "bg-[oklch(0.65_0.18_145_/_0.2)] text-[oklch(0.65_0.18_145)] border-[oklch(0.65_0.18_145_/_0.3)] text-xs"
                    : "bg-destructive/10 text-destructive border-destructive/30 text-xs"
                }
                variant="outline"
              >
                {underpartRecord.work_status}
              </Badge>
            </div>
          )}

          {/* Expected date */}
          {hasExpectedDate && !isParking && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                Due:{" "}
                {new Date(
                  (record as Container | Cabin | Painting).expected_date,
                ).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Painting colours */}
          {type === "painting" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="break-words">
                Int: {(record as Painting).interior_colour} · Ext:{" "}
                {(record as Painting).exterior_colour}
              </span>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words">
              {record.notes}
            </p>
          )}

          {/* Photo thumbnails */}
          {photos.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </span>
              </div>
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
                      photos[MAX_VISIBLE_THUMBS] &&
                      setLightboxUrl(photos[MAX_VISIBLE_THUMBS])
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
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2 pt-1">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs flex-1 min-w-0"
                  onClick={() => onEdit(record)}
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
                  onClick={() => onDelete(record.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setLightboxUrl(null);
          }}
          aria-label="Close lightbox"
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper, keyboard close handled by parent button */}
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />
            <span
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
              aria-hidden="true"
            >
              <X className="w-4 h-4" />
            </span>
          </div>
        </button>
      )}
    </>
  );
}
