import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "./StorageClient";

const SENTINEL = "!caf!";

// Lazily cached storage client
let storageClientCache: StorageClient | null = null;

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
      const bytes = new Uint8Array(await file.arrayBuffer());
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
      const cfg = configOverride ?? (await getConfig());
      return `${cfg.storageGatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(cfg.backendCanisterId)}&project_id=${encodeURIComponent(cfg.projectId)}`;
    }

    // Legacy format: raw image bytes → create object URL
    const blob = new Blob([new Uint8Array(photo.buffer as ArrayBuffer)]);
    return URL.createObjectURL(blob);
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
