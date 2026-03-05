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
import type { Delivery } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DeliveryFormData = Omit<Delivery, "id" | "created_at" | "updated_at"> & {
  photoFiles?: File[];
  keptPhotoUrls?: string[];
};

interface DeliveryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryFormData) => Promise<void>;
  initial?: Delivery | null;
}

export default function DeliveryForm({
  open,
  onClose,
  onSubmit,
  initial,
}: DeliveryFormProps) {
  const [vehicleNo, setVehicleNo] = useState(initial?.vehicle_no || "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [teamName, setTeamName] = useState(initial?.team_name || "");
  const [customName, setCustomName] = useState(initial?.custom_name || "");
  const [deliveryDate, setDeliveryDate] = useState(
    initial?.delivery_date || new Date().toISOString().split("T")[0],
  );
  const [driverName, setDriverName] = useState(initial?.driver_name || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setVehicleNo(initial.vehicle_no || "");
      setCustomerName(initial.customer_name || "");
      setTeamName(initial.team_name || "");
      setCustomName(initial.custom_name || "");
      setDeliveryDate(
        initial.delivery_date || new Date().toISOString().split("T")[0],
      );
      setDriverName(initial.driver_name || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setVehicleNo("");
      setCustomerName("");
      setTeamName("");
      setCustomName("");
      setDeliveryDate(new Date().toISOString().split("T")[0]);
      setDriverName("");
      setNotes("");
      setKeptPhotoUrls([]);
    }
    setNewFiles([]);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo.trim()) {
      toast.error("Vehicle number is required");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!deliveryDate) {
      toast.error("Delivery date is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        vehicle_no: vehicleNo.trim(),
        customer_name: customerName.trim(),
        team_name: teamName.trim(),
        custom_name: customName.trim(),
        delivery_date: deliveryDate,
        driver_name: driverName.trim(),
        notes,
        photos: keptPhotoUrls,
        photoFiles: newFiles,
        keptPhotoUrls,
      });
      onClose();
    } catch {
      toast.error("Failed to save delivery record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg w-[95vw] max-h-[95dvh] overflow-y-auto"
        data-ocid="delivery.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Delivery" : "New Delivery"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="delivery-vehicle-no">Vehicle No *</Label>
            <Input
              id="delivery-vehicle-no"
              data-ocid="delivery.input"
              type="text"
              className="h-11 text-base"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="e.g. TN 01 AB 1234"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-customer-name">Customer Name *</Label>
            <Input
              id="delivery-customer-name"
              type="text"
              className="h-11 text-base"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Kumar Transports"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-team-name">Team Name</Label>
            <Input
              id="delivery-team-name"
              type="text"
              className="h-11 text-base"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Team A"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-custom-name">Custom Name</Label>
            <Input
              id="delivery-custom-name"
              type="text"
              className="h-11 text-base"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Special label or alias"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-date">Delivery Date *</Label>
            <Input
              id="delivery-date"
              type="date"
              className="h-11 text-base"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-driver-name">Driver Name</Label>
            <Input
              id="delivery-driver-name"
              type="text"
              className="h-11 text-base"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Rajan"
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
              data-ocid="delivery.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={submitting}
              data-ocid="delivery.submit_button"
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
