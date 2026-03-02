import { Button } from "@/components/ui/button";
import { ImagePlus, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PhotoUploaderProps {
  existingPhotoUrls: string[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (url: string) => void;
  maxPhotos?: number;
}

export default function PhotoUploader({
  existingPhotoUrls,
  onFilesChange,
  onRemoveExisting,
  maxPhotos = 10,
}: PhotoUploaderProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount / change
  useEffect(() => {
    return () => {
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  }, [previewUrls]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/"),
      );
      const total = existingPhotoUrls.length + newFiles.length + arr.length;
      const allowed = arr.slice(
        0,
        Math.max(0, maxPhotos - existingPhotoUrls.length - newFiles.length),
      );
      if (total > maxPhotos) {
        // silently cap
      }
      if (allowed.length === 0) return;
      const urls = allowed.map((f) => URL.createObjectURL(f));
      setNewFiles((prev) => {
        const updated = [...prev, ...allowed];
        onFilesChange(updated);
        return updated;
      });
      setPreviewUrls((prev) => [...prev, ...urls]);
    },
    [existingPhotoUrls.length, newFiles.length, maxPhotos, onFilesChange],
  );

  const removeNew = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setNewFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesChange(updated);
      return updated;
    });
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const closeLightbox = () => setLightboxUrl(null);

  const totalPhotos = existingPhotoUrls.length + newFiles.length;
  const canAddMore = totalPhotos < maxPhotos;

  return (
    <div className="space-y-2">
      {/* Existing saved photos */}
      {existingPhotoUrls.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            Saved photos ({existingPhotoUrls.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {existingPhotoUrls.map((url) => (
              <div key={url} className="relative group">
                <button
                  type="button"
                  className="block w-16 h-16 rounded-md overflow-hidden border border-border cursor-pointer p-0 focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setLightboxUrl(url)}
                  aria-label="View full size"
                >
                  <img
                    src={url}
                    alt="Saved"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors pointer-events-none">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  onClick={() => onRemoveExisting?.(url)}
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New file previews */}
      {newFiles.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            New photos ({newFiles.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {newFiles.map((file, i) => (
              <div key={`new-${file.name}-${i}`} className="relative group">
                <button
                  type="button"
                  className="block w-16 h-16 rounded-md overflow-hidden border border-border cursor-pointer p-0 focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setLightboxUrl(previewUrls[i])}
                  aria-label="View full size"
                >
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors pointer-events-none">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
                <button
                  type="button"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  onClick={() => removeNew(i)}
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone — real <button> so it's natively focusable and keyboard-accessible */}
      {canAddMore && (
        <button
          type="button"
          className={`relative w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Upload photos"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span>{" "}
            or drag &amp; drop
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalPhotos}/{maxPhotos} photos · Images only
          </p>
        </button>
      )}

      {!canAddMore && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-muted-foreground">
            Maximum {maxPhotos} photos reached
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setNewFiles([]);
              for (const url of previewUrls) URL.revokeObjectURL(url);
              setPreviewUrls([]);
              onFilesChange([]);
            }}
          >
            Clear new
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") closeLightbox();
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
              alt="Full size preview"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
            <span
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-lg"
              aria-hidden="true"
            >
              <X className="w-4 h-4" />
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
