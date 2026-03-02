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
import type { Painting } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PaintingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Painting, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: Painting | null;
}

const TEAM_NOS = ["1", "2"];
const STAGES = ["Not Started", "Primer Done", "Fully Painted"];

export default function PaintingForm({
  open,
  onClose,
  onSubmit,
  initial,
}: PaintingFormProps) {
  const [teamNo, setTeamNo] = useState(initial?.team_no || "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [interiorColour, setInteriorColour] = useState(
    initial?.interior_colour || "",
  );
  const [exteriorColour, setExteriorColour] = useState(
    initial?.exterior_colour || "",
  );
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
      setTeamNo(initial.team_no || "");
      setCustomerName(initial.customer_name || "");
      setInteriorColour(initial.interior_colour || "");
      setExteriorColour(initial.exterior_colour || "");
      setStage(initial.stage || "Not Started");
      setExpectedDate(initial.expected_date || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setTeamNo("");
      setCustomerName("");
      setInteriorColour("");
      setExteriorColour("");
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
    setSubmitting(true);
    try {
      await onSubmit({
        team_no: teamNo,
        customer_name: customerName,
        interior_colour: interiorColour,
        exterior_colour: exteriorColour,
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
          <DialogTitle>
            {initial ? "Edit Painting Job" : "New Painting Job"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Team No</Label>
            <Select value={teamNo} onValueChange={setTeamNo}>
              <SelectTrigger className="h-11">
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
            <Label>Customer Name *</Label>
            <Input
              className="h-11 text-base"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Muthukumar Freight"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Interior Colour</Label>
              <Input
                className="h-11 text-base"
                value={interiorColour}
                onChange={(e) => setInteriorColour(e.target.value)}
                placeholder="e.g. Off White"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Exterior Colour</Label>
              <Input
                className="h-11 text-base"
                value={exteriorColour}
                onChange={(e) => setExteriorColour(e.target.value)}
                placeholder="e.g. Tata Blue"
              />
            </div>
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
