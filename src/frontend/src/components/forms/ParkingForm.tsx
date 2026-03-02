import PhotoUploader from "@/components/forms/PhotoUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Parking } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ParkingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Parking, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: Parking | null;
}

export default function ParkingForm({
  open,
  onClose,
  onSubmit,
  initial,
}: ParkingFormProps) {
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [waitingFor, setWaitingFor] = useState(initial?.waiting_for || "");
  const [entryDate, setEntryDate] = useState(initial?.entry_date || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setCustomerName(initial.customer_name || "");
      setWaitingFor(initial.waiting_for || "");
      setEntryDate(initial.entry_date || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setCustomerName("");
      setWaitingFor("");
      setEntryDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setKeptPhotoUrls([]);
    }
    setNewFiles([]);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: customerName,
        waiting_for: waitingFor,
        entry_date: entryDate,
        notes,
        photos: keptPhotoUrls,
        photoFiles: newFiles,
        keptPhotoUrls,
      });
      onClose();
    } catch {
      toast.error("Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[95dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Parking Record" : "New Parking Record"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Customer Name *</Label>
            <Input
              className="h-11 text-base"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rajan Transports"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Waiting For</Label>
            <Input
              className="h-11 text-base"
              value={waitingFor}
              onChange={(e) => setWaitingFor(e.target.value)}
              placeholder="e.g. Engine Parts, Owner Approval"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Entry Date</Label>
            <Input
              type="date"
              className="h-11 text-base"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              className="text-base resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

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
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-11" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initial ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
