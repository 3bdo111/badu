import { NextResponse } from "next/server";
import path from "path";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { getMediaStore } from "@/lib/media/media-store";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = getMediaStore();
    const files = await store.list();

    // Backwards-compatible response shape for the media library UI.
    return NextResponse.json({
      success: true,
      files: files.map((f) => ({
        url: f.url,
        filename: f.key,
        size: f.size,
        createdAt: f.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("[badu]")) {
      return NextResponse.json({ error: "Media storage is not configured." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to list media files." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: {
            en: "Admin authentication required.",
            ar: "يلزم تسجيل الدخول كمسؤول.",
          },
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed formats: JPG, PNG, WebP, GIF, AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds limit of 5MB." },
        { status: 400 }
      );
    }

    // Sanitized, server-generated file name — the client-provided name is
    // never trusted and never used as a path.
    const rawExt = path.extname(file.name) || ".jpg";
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9.]/g, "");
    const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : ".jpg";
    const randomHash = Math.random().toString(36).substring(2, 9);
    const filename = `sf-${Date.now()}-${randomHash}${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const store = getMediaStore();
    const saved = await store.save({
      filename,
      contentType: file.type.toLowerCase(),
      buffer,
    });

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.key,
      size: saved.size,
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("[badu]")) {
      return NextResponse.json({ error: "Media storage is not configured." }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
