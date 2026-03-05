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
import type { Underpart } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UnderpartFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Underpart, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ) => Promise<void>;
  initial?: Underpart | null;
}

const TEAM_NAMES = ["Mani", "Thangavel"];
const WORK_STATUSES = ["Not Finished", "Finished"];

export default function UnderpartForm({
  open,
  onClose,
  onSubmit,
  initial,
}: UnderpartFormProps) {
  const [teamName, setTeamName] = useState(initial?.team_name || "");
  const [customerName, setCustomerName] = useState(
    initial?.customer_name || "",
  );
  const [customName, setCustomName] = useState(initial?.custom_name || "");
  const [workStatus, setWorkStatus] = useState(
    initial?.work_status || "Not Finished",
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setTeamName(initial.team_name || "");
      setCustomerName(initial.customer_name || "");
      setCustomName(initial.custom_name || "");
      setWorkStatus(initial.work_status || "Not Finished");
      setNotes(initial.notes || "");
      setKeptPhotoUrls(initial.photos || []);
    } else {
      setTeamName("");
      setCustomerName("");
      setCustomName("");
      setWorkStatus("Not Finished");
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
        team_name: teamName,
        customer_name: customerName,
        custom_name: customName,
        work_status: workStatus,
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
            {initial ? "Edit Underpart Job" : "New Underpart Job"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Team Name</Label>
            <Select value={teamName} onValueChange={setTeamName}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_NAMES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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
              placeholder="e.g. Selvam & Sons"
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
            <Label>Work Status</Label>
            <Select value={workStatus} onValueChange={setWorkStatus}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
