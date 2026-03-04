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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Cabin } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CabinFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Cabin, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: Cabin | null;
}

const TEAM_NOS = ["1", "2", "3", "4", "5"];
const CABIN_TYPES = [
  "Straight Type",
  "Karur Grill",
  "Aerodynamic",
  "Centered Glass",
  "Curved Type",
];
const STAGES = [
  "Not Started",
  "Cage Angle",
  "Wood Chips",
  "Back Plywood",
  "Aluminium Sheet",
  "Soset",
];

export default function CabinForm({
  open,
  onClose,
  onSubmit,
  initial,
}: CabinFormProps) {
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [teamNo, setTeamNo] = useState(initial?.team_no || "");
  const [cabinType, setCabinType] = useState(initial?.cabin_type || "");
  const [stage, setStage] = useState(initial?.stage || "Not Started");
  const [expectedDate, setExpectedDate] = useState(
    initial?.expected_date || "",
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setCustomerName(initial.customer_name || "");
      setTeamNo(initial.team_no || "");
      setCabinType(initial.cabin_type || "");
      setStage(initial.stage || "Not Started");
      setExpectedDate(initial.expected_date || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setCustomerName("");
      setTeamNo("");
      setCabinType("");
      setStage("Not Started");
      setExpectedDate("");
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
    if (!teamNo) {
      toast.error("Team number is required");
      return;
    }
    if (!stage) {
      toast.error("Stage is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: customerName.trim(),
        team_no: teamNo,
        cabin_type: cabinType,
        stage,
        expected_date: expectedDate,
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
          <DialogTitle>{initial ? "Edit Cabin" : "New Cabin"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cabin-customer-name">Customer Name *</Label>
            <Input
              id="cabin-customer-name"
              data-ocid="cabin.input"
              type="text"
              className="h-11 text-base"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Kumar Transports"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Team No *</Label>
            <Select value={teamNo} onValueChange={setTeamNo}>
              <SelectTrigger className="h-11" data-ocid="cabin.select">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_NOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    Team {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cabin Type</Label>
            <Select value={cabinType} onValueChange={setCabinType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select cabin type" />
              </SelectTrigger>
              <SelectContent>
                {CABIN_TYPES.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Stage *</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Expected Date</Label>
            <Input
              type="date"
              className="h-11 text-base"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
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
              data-ocid="cabin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={submitting}
              data-ocid="cabin.submit_button"
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
