import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "./StorageClient";

const SENTINEL = "!caf!";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.75;

/**
 * Compress and resize a File to a max dimension of MAX_DIMENSION px,
 * encoded as JPEG at JPEG_QUALITY. Returns a Uint8Array of the compressed bytes.
 */
async function compressImage(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          blob
            .arrayBuffer()
            .then((buf) => resolve(new Uint8Array(buf)))
            .catch(reject);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };
    img.src = objectUrl;
  });
}

// Lazily cached storage client
let storageClientCache: StorageClient | null = null;

// Cache resolved photo URLs so repeated refetches don't re-decode the same hashes
const resolvedUrlCache = new Map<string, string>();

async function getStorageClient(): Promise<StorageClient> {
  if (storageClientCache) return storageClientCache;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  storageClientCache = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return storageClientCache;
}

/**
 * Upload photo files to blob storage and return encoded hash Uint8Arrays.
 * Each file is uploaded individually to avoid ICP message size limits.
 */
export async function uploadPhotoFiles(files: File[]): Promise<Uint8Array[]> {
  if (files.length === 0) return [];
  const client = await getStorageClient();
  const results = await Promise.all(
    files.map(async (file) => {
      const bytes = await compressImage(file);
      const { hash } = await client.putFile(bytes);
      return new TextEncoder().encode(SENTINEL + hash);
    }),
  );
  return results;
}

/**
 * Resolve a photo Uint8Array (or string) to a displayable URL.
 * If it's a sentinel-prefixed hash, build the blob gateway URL.
 * If it's already a URL string, return as-is.
 */
export async function resolvePhotoUrl(
  photo: unknown,
  configOverride?: {
    storageGatewayUrl: string;
    backendCanisterId: string;
    projectId: string;
  },
): Promise<string> {
  if (typeof photo === "string" && photo.length > 0) return photo;

  if (photo instanceof Uint8Array && photo.length > 0) {
    const decoded = new TextDecoder().decode(photo);

    // New format: sentinel + sha256 hash
    if (decoded.startsWith(SENTINEL)) {
      const hash = decoded.substring(SENTINEL.length);
      if (resolvedUrlCache.has(hash)) return resolvedUrlCache.get(hash)!;
      const cfg = configOverride ?? (await getConfig());
      const url = `${cfg.storageGatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(cfg.backendCanisterId)}&project_id=${encodeURIComponent(cfg.projectId)}`;
      resolvedUrlCache.set(hash, url);
      return url;
    }

    // Legacy format: raw image bytes → create object URL
    const cacheKey = `legacy-${photo.length}-${photo[0]}-${photo[photo.length - 1]}`;
    if (resolvedUrlCache.has(cacheKey)) return resolvedUrlCache.get(cacheKey)!;
    const blob = new Blob([new Uint8Array(photo.buffer as ArrayBuffer)]);
    const url = URL.createObjectURL(blob);
    resolvedUrlCache.set(cacheKey, url);
    return url;
  }

  return "";
}

/**
 * Get config values for URL building.
 */
async function getConfig(): Promise<{
  storageGatewayUrl: string;
  backendCanisterId: string;
  projectId: string;
}> {
  const config = await loadConfig();
  return {
    storageGatewayUrl: config.storage_gateway_url,
    backendCanisterId: config.backend_canister_id,
    projectId: config.project_id,
  };
}

/**
 * Map an array of raw photo values (Uint8Array or string) to display URLs asynchronously.
 */
export async function resolvePhotos(photos: unknown[]): Promise<string[]> {
  const urls = await Promise.all(photos.map((p) => resolvePhotoUrl(p)));
  return urls.filter(Boolean);
}
