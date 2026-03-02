import RecordCard from "@/components/dashboard/RecordCard";
import ParkingForm from "@/components/forms/ParkingForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Parking } from "@/lib/types";
import { Car, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ParkingSectionProps {
  data: Parking[];
  loading: boolean;
  error: Error | null;
  isReadOnly?: boolean;
  onInsert?: (
    data: Omit<Parking, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<unknown>;
  onUpdate?: (
    id: string,
    data: Partial<Parking> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function ParkingSection({
  data,
  loading,
  error,
  isReadOnly = false,
  onInsert,
  onUpdate,
  onDelete,
}: ParkingSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Parking | null>(null);

  const handleEdit = (record: Parking) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!window.confirm("Delete this parking record?")) return;
    try {
      await onDelete(id);
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handleFormSubmit = async (
    formData: Omit<Parking, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (editRecord && onUpdate) {
      await onUpdate(editRecord.id, formData);
      toast.success("Parking record updated");
    } else if (onInsert) {
      await onInsert(formData);
      toast.success("Parking record added");
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Error loading parking records: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            className="h-11 bg-[oklch(0.65_0.18_145)] hover:bg-[oklch(0.58_0.18_145)] text-white"
            onClick={() => {
              setEditRecord(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Parking Record
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {["skel-1", "skel-2", "skel-3"].map((key) => (
            <Skeleton key={key} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Car className="w-10 h-10 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground text-sm">
            No parking records yet.
          </p>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditRecord(null);
                setFormOpen(true);
              }}
            >
              Add first parking record
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((record) => (
            <RecordCard
              key={record.id}
              type="parking"
              record={record}
              onEdit={!isReadOnly ? () => handleEdit(record) : undefined}
              onDelete={!isReadOnly ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {!isReadOnly && (
        <ParkingForm
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
