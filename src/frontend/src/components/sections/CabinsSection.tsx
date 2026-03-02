import RecordCard from "@/components/dashboard/RecordCard";
import CabinForm from "@/components/forms/CabinForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cabin } from "@/lib/types";
import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CabinsSectionProps {
  data: Cabin[];
  loading: boolean;
  error: Error | null;
  isReadOnly?: boolean;
  onInsert?: (
    data: Omit<Cabin, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<unknown>;
  onUpdate?: (
    id: string,
    data: Partial<Cabin> & { photoFiles?: File[]; keptPhotoUrls?: string[] },
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function CabinsSection({
  data,
  loading,
  error,
  isReadOnly = false,
  onInsert,
  onUpdate,
  onDelete,
}: CabinsSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Cabin | null>(null);

  const handleEdit = (record: Cabin) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    if (!window.confirm("Delete this cabin record?")) return;
    try {
      await onDelete(id);
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const handleFormSubmit = async (
    formData: Omit<Cabin, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => {
    if (editRecord && onUpdate) {
      await onUpdate(editRecord.id, formData);
      toast.success("Cabin updated");
    } else if (onInsert) {
      await onInsert(formData);
      toast.success("Cabin added");
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Error loading cabins: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button
            className="h-11 bg-[oklch(0.6_0.2_250)] hover:bg-[oklch(0.53_0.2_250)] text-white"
            onClick={() => {
              setEditRecord(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cabin
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
          <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground text-sm">No cabins yet.</p>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditRecord(null);
                setFormOpen(true);
              }}
            >
              Add first cabin
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((record) => (
            <RecordCard
              key={record.id}
              type="cabin"
              record={record}
              onEdit={!isReadOnly ? () => handleEdit(record) : undefined}
              onDelete={!isReadOnly ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {!isReadOnly && (
        <CabinForm
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
