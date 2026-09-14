"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import styles from "./media-picker.module.css";

interface MediaFile {
  url: string;
  filename: string;
  size: number;
  createdAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  isAr?: boolean;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelectImage,
  isAr = false,
}: MediaPickerModalProps) {
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [libraryFiles, setLibraryFiles] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    if (isOpen && tab === "library") {
      let isMounted = true;
      (async () => {
        setLoadingLibrary(true);
        try {
          const res = await fetch("/api/admin/uploads");
          if (res.ok && isMounted) {
            const data = await res.json();
            if (data.files) {
              setLibraryFiles(data.files);
            }
          }
        } catch {
          // Library load failsafe
        } finally {
          if (isMounted) setLoadingLibrary(false);
        }
      })();
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, tab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onSelectImage(data.url);
        onClose();
      } else {
        setUploadError(data.error || (isAr ? "فشل رفع الصورة." : "Failed to upload image."));
      }
    } catch {
      setUploadError(isAr ? "حدث خطأ أثناء رفع الملف." : "Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isAr ? "إدارة الوسائط والتقاط الصور" : "Storefront Media Manager"}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "upload" ? styles.tabActive : ""}`}
            onClick={() => setTab("upload")}
          >
            {isAr ? "رفع صورة جديدة" : "Upload Image"}
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "library" ? styles.tabActive : ""}`}
            onClick={() => setTab("library")}
          >
            {isAr ? "مكتَبة الصور" : "Media Library"}
          </button>
        </div>

        <div className={styles.body}>
          {tab === "upload" ? (
            <div className={styles.uploadBox}>
              <p className={styles.uploadPrompt}>
                {isAr
                  ? "اختر صورة من جهازك لرفعها إلى واجهة المتجر"
                  : "Choose an image file from your computer to upload."}
              </p>
              <p className={styles.uploadSubtext}>
                {isAr
                  ? "الصيغ المدعومة: JPG, PNG, WebP, AVIF (الحد الأقصى: 5MB)"
                  : "Supported formats: JPG, PNG, WebP, AVIF (Max 5MB)"}
              </p>

              <label className={styles.fileInputLabel}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="visually-hidden"
                />
                {uploading
                  ? isAr
                    ? "جاري رفع الصورة..."
                    : "Uploading image..."
                  : isAr
                  ? "اختر ملف الصورة..."
                  : "Select Image File..."}
              </label>

              {uploadError && <div className={styles.errorMessage}>{uploadError}</div>}
            </div>
          ) : (
            <div className={styles.libraryContainer}>
              {loadingLibrary ? (
                <p className={styles.loadingText}>
                  {isAr ? "جاري تحميل الصور..." : "Loading media files..."}
                </p>
              ) : libraryFiles.length === 0 ? (
                <p className={styles.emptyText}>
                  {isAr ? "لا توجد صور مرفوعة سابقاً." : "No uploaded media found."}
                </p>
              ) : (
                <div className={styles.grid}>
                  {libraryFiles.map((file) => (
                    <button
                      key={file.url}
                      type="button"
                      onClick={() => {
                        onSelectImage(file.url);
                        onClose();
                      }}
                      className={styles.gridCard}
                    >
                      <div className={styles.thumbWrap}>
                        <Image
                          src={file.url}
                          alt={file.filename}
                          fill
                          sizes="140px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span className={styles.fileName}>{file.filename}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
