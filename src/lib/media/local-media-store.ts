import fs from "fs";
import path from "path";
import type { MediaFileInput, MediaObject, MediaStore } from "./media-store";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "storefront");
const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif|avif)$/i;

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/** Development-only store: files under public/uploads, served by Next.js. */
export function createLocalMediaStore(): MediaStore {
  return {
    kind: "local",

    async save(file: MediaFileInput): Promise<MediaObject> {
      ensureUploadDir();
      const destinationPath = path.join(UPLOAD_DIR, file.filename);

      // Path traversal safety verification
      const resolvedPath = path.resolve(destinationPath);
      if (!resolvedPath.startsWith(path.resolve(UPLOAD_DIR))) {
        throw new Error("Invalid upload destination.");
      }

      fs.writeFileSync(resolvedPath, file.buffer);

      return {
        key: file.filename,
        url: `/uploads/storefront/${file.filename}`,
        size: file.buffer.byteLength,
        createdAt: new Date().toISOString(),
      };
    },

    async list(): Promise<MediaObject[]> {
      ensureUploadDir();
      return fs
        .readdirSync(UPLOAD_DIR)
        .filter((f) => IMAGE_EXT.test(f))
        .map((f) => {
          const stats = fs.statSync(path.join(UPLOAD_DIR, f));
          return {
            key: f,
            url: `/uploads/storefront/${f}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    async remove(key: string): Promise<void> {
      const target = path.resolve(path.join(UPLOAD_DIR, key));
      if (!target.startsWith(path.resolve(UPLOAD_DIR))) {
        throw new Error("Invalid media key.");
      }
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
    },
  };
}
