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
import type { Container } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ContainerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Container, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: Container | null;
}

const TEAM_LEADERS = ["Raja", "Vinoth", "Ashok", "Prasanth"];
const STAGES = [
  "Not Started",
  "Basement",
  "Door Rear End",
  "Door Front End",
  "Sidewall",
  "Roofing",
];

export default function ContainerForm({
  open,
  onClose,
  onSubmit,
  initial,
}: ContainerFormProps) {
  const [teamLeader, setTeamLeader] = useState(initial?.team_leader || "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [customName, setCustomName] = useState(initial?.custom_name || "");
  const [containerType, setContainerType] = useState(
    initial?.container_type || "",
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
      setTeamLeader(initial.team_leader || "");
      setCustomerName(initial.customer_name || "");
      setCustomName(initial.custom_name || "");
      setContainerType(initial.container_type || "");
      setStage(initial.stage || "Not Started");
      setExpectedDate(initial.expected_date || "");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setTeamLeader("");
      setCustomerName("");
      setCustomName("");
      setContainerType("");
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
    if (!stage) {
      toast.error("Stage is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        team_leader: teamLeader,
        customer_name: customerName,
        custom_name: customName,
        container_type: containerType,
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
            {initial ? "Edit Container" : "New Container"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Team Leader</Label>
            <Select value={teamLeader} onValueChange={setTeamLeader}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select team leader" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_LEADERS.map((tl) => (
                  <SelectItem key={tl} value={tl}>
                    {tl}
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
              placeholder="e.g. Kumar Transports"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Custom Name</Label>
            <Input
              className="h-11 text-base"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Special label or alias"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Container Type</Label>
            <Input
              className="h-11 text-base"
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              placeholder="e.g. 20ft Standard"
            />
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
