import type { Delivery } from "@/lib/types";
import { useCallback, useState } from "react";

const STORAGE_KEY = "deepam_deliveries";

/** Compress and resize a File to max 1200×1200 JPEG before storing as data URL. */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const MAX_DIM = 1200;
    const QUALITY = 0.75;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.src = objectUrl;
  });
}

function loadFromStorage(): Delivery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Delivery[];
  } catch {
    return [];
  }
}

function saveToStorage(items: Delivery[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useDelivery() {
  const [data, setData] = useState<Delivery[]>(() => loadFromStorage());
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setData(loadFromStorage());
  }, []);

  const insert = async (
    item: Omit<Delivery, "id" | "created_at" | "updated_at"> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();

    const photoDataUrls = await Promise.all(
      (item.photoFiles || []).map(fileToDataUrl),
    );

    const record: Delivery = {
      id,
      vehicle_no: item.vehicle_no,
      customer_name: item.customer_name,
      delivery_date: item.delivery_date,
      driver_name: item.driver_name,
      notes: item.notes,
      photos: photoDataUrls,
      created_at: now,
      updated_at: now,
    };

    setData((prev) => {
      const updated = [record, ...prev];
      saveToStorage(updated);
      return updated;
    });

    return id;
  };

  const update = async (
    id: string,
    item: Partial<Delivery> & {
      photoFiles?: File[];
      keptPhotoUrls?: string[];
    },
  ): Promise<void> => {
    const now = new Date().toISOString();

    const newPhotoDataUrls = await Promise.all(
      (item.photoFiles || []).map(fileToDataUrl),
    );

    const keptUrls = item.keptPhotoUrls ?? [];
    const mergedPhotos = [...keptUrls, ...newPhotoDataUrls];

    setData((prev) => {
      const updated = prev.map((record) => {
        if (record.id !== id) return record;
        return {
          ...record,
          ...item,
          photos: mergedPhotos,
          updated_at: now,
          photoFiles: undefined,
          keptPhotoUrls: undefined,
        };
      });
      saveToStorage(updated);
      return updated;
    });
  };

  const remove = async (id: string): Promise<void> => {
    setData((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  return { data, loading, error, refetch, insert, update, remove };
}
