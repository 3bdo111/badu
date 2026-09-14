import { put, list, del } from "@vercel/blob";
import type { MediaFileInput, MediaObject, MediaStore } from "./media-store";

export interface VercelBlobMediaStoreOptions {
  token: string;
  /** Optional path prefix inside the blob store. */
  prefix?: string;
}

/**
 * Production media store backed by Vercel Blob (durable object storage).
 * Public URLs are absolute and served from the blob CDN, so they survive
 * redeployments and are independent of the Next.js deployment.
 */
export function createVercelBlobMediaStore(options: VercelBlobMediaStoreOptions): MediaStore {
  const prefix = options.prefix ?? "storefront";
  const token = options.token;

  return {
    kind: "blob",

    async save(file: MediaFileInput): Promise<MediaObject> {
      const blob = await put(`${prefix}/${file.filename}`, file.buffer, {
        access: "public",
        contentType: file.contentType,
        token,
        // Server-generated random names → no accidental overwrites, no
        // client-controlled paths.
        addRandomSuffix: false,
        allowOverwrite: false,
      });

      return {
        key: file.filename,
        url: blob.url,
        size: file.buffer.byteLength,
        createdAt: new Date().toISOString(),
      };
    },

    async list(): Promise<MediaObject[]> {
      const objects: MediaObject[] = [];
      let cursor: string | undefined;

      do {
        const page = await list({ prefix: `${prefix}/`, cursor, token });
        for (const blob of page.blobs) {
          objects.push({
            key: blob.pathname.slice(prefix.length + 1),
            url: blob.url,
            size: blob.size,
            createdAt: blob.uploadedAt.toISOString(),
          });
        }
        cursor = page.hasMore ? (page.cursor ?? undefined) : undefined;
      } while (cursor);

      return objects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async remove(key: string): Promise<void> {
      if (key.includes("..") || key.includes("/") || key.includes("\\")) {
        throw new Error("Invalid media key.");
      }
      await del(`${prefix}/${key}`, { token });
    },
  };
}
