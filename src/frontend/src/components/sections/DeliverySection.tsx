import RecordCard from "@/components/dashboard/RecordCard";
import DeliveryForm from "@/components/forms/DeliveryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Delivery } from "@/lib/types";
import { CheckCircle2, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Returns today's date in YYYY-MM-DD format (local timezone) */
function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface DeliverySectionProps {
  data: Delivery[];
  loading: boolean;
  error: Error | null;
  isReadOnly?: boolean;
  onInsert?: (
    data: Omit<Delivery, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<unknown>;
  onUpdate?: (
    id: string,
    data: Partial<Delivery> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function DeliverySection({
  data,
  loading,
  error,
  isReadOnly = false,
  onInsert,
  onUpdate,
  onDelete,
}: DeliverySectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Delivery | null>(null);

  const handleEdit = (record: Delivery) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!window.confirm("Delete this delivery record?")) return;
    try {
      await onDelete(id);
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handleFormSubmit = async (
    formData: Omit<Delivery, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (editRecord && onUpdate) {
      await onUpdate(editRecord.id, formData);
      toast.success("Delivery updated");
    } else if (onInsert) {
      await onInsert(formData);
      toast.success("Delivery added");
    }
  };

  if (error) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="delivery.error_state"
      >
        <p>Error loading deliveries: {error.message}</p>
      </div>
    );
  }

  const today = getTodayString();
  const todayDeliveries = data.filter((d) => d.delivery_date === today);
  const otherDeliveries = data.filter((d) => d.delivery_date !== today);

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            className="h-11 bg-[oklch(0.6_0.2_300)] hover:bg-[oklch(0.53_0.2_300)] text-white"
            onClick={() => {
              setEditRecord(null);
              setFormOpen(true);
            }}
            data-ocid="delivery.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Delivery
          </Button>
        </div>
      )}

      {loading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="delivery.loading_state"
        >
          {["skel-1", "skel-2", "skel-3"].map((key) => (
            <Skeleton key={key} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div
          className="text-center py-16 space-y-3"
          data-ocid="delivery.empty_state"
        >
          <Truck className="w-10 h-10 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground text-sm">No deliveries yet.</p>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditRecord(null);
                setFormOpen(true);
              }}
            >
              Add first delivery
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today's deliveries */}
          {todayDeliveries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[oklch(0.6_0.2_300)]" />
                <h3 className="text-sm font-semibold text-foreground">
                  Today's Deliveries
                </h3>
                <Badge
                  className="text-[10px] px-1.5 py-0 h-4 bg-[oklch(0.6_0.2_300_/_0.15)] text-[oklch(0.6_0.2_300)] border-[oklch(0.6_0.2_300_/_0.3)]"
                  variant="outline"
                >
                  {todayDeliveries.length} vehicle
                  {todayDeliveries.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="rounded-lg border border-[oklch(0.6_0.2_300_/_0.25)] bg-[oklch(0.6_0.2_300_/_0.04)] p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {todayDeliveries.map((record, index) => (
                    <div
                      key={record.id}
                      data-ocid={`delivery.item.${index + 1}`}
                    >
                      <RecordCard
                        type="delivery"
                        record={record}
                        onEdit={
                          !isReadOnly ? () => handleEdit(record) : undefined
                        }
                        onDelete={!isReadOnly ? handleDelete : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other scheduled deliveries */}
          {otherDeliveries.length > 0 && (
            <div className="space-y-3">
              {todayDeliveries.length > 0 && (
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Other Deliveries
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {otherDeliveries.map((record, index) => (
                  <div
                    key={record.id}
                    data-ocid={`delivery.item.${todayDeliveries.length + index + 1}`}
                  >
                    <RecordCard
                      type="delivery"
                      record={record}
                      onEdit={
                        !isReadOnly ? () => handleEdit(record) : undefined
                      }
                      onDelete={!isReadOnly ? handleDelete : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isReadOnly && (
        <DeliveryForm
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
