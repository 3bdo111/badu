/**
 * Logical media storage interface.
 *
 * The UI and API layers do not care where bytes physically live:
 *   - Development:  local filesystem under public/uploads/storefront
 *   - Production:   Vercel Blob (durable object storage)
 *
 * Selection is explicit: production requires BLOB_READ_WRITE_TOKEN and fails
 * fast without it — uploads never silently fall back to a ephemeral local
 * disk on Vercel.
 */

export interface MediaFileInput {
  /** Sanitized, server-generated file name (never client-provided). */
  filename: string;
  contentType: string;
  buffer: Buffer;
}

export interface MediaObject {
  /** Logical key (file name) within the store. */
  key: string;
  /** Public URL. Absolute for blob storage, root-relative path locally. */
  url: string;
  size: number;
  createdAt: string;
}

export interface MediaStore {
  readonly kind: "local" | "blob";
  save(file: MediaFileInput): Promise<MediaObject>;
  list(): Promise<MediaObject[]>;
  remove(key: string): Promise<void>;
}

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Resolve the media store for the current environment.
 * Throws in production when blob storage is not configured.
 */
export function getMediaStore(): MediaStore {
  if (isBlobStorageConfigured()) {
    const { createVercelBlobMediaStore } = require("./vercel-blob-media-store") as typeof import("./vercel-blob-media-store");
    return createVercelBlobMediaStore({ token: process.env.BLOB_READ_WRITE_TOKEN! });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[badu] BLOB_READ_WRITE_TOKEN is required in production for durable media storage. " +
        "Refusing to fall back to local disk."
    );
  }

  const { createLocalMediaStore } = require("./local-media-store") as typeof import("./local-media-store");
  return createLocalMediaStore();
}
