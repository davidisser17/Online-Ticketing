// ============================================================
// ImageUploader — upload gambar ke Firebase Storage
// ============================================================

import { useRef, useState } from 'react';
import { uploadConcertImage, deleteConcertImage } from '@/services/mediaService';

interface ImageUploaderProps {
  concertId: string;
  value: string[];                        // current poster URLs
  onChange: (urls: string[]) => void;     // notify parent of URL changes
  maxFiles?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  preview: string;
  progress: number;
  error?: string;
}

// storage path diturunkan dari URL — simpan di state terpisah
interface StoredImage {
  url: string;
  path: string;
}

export default function ImageUploader({
  concertId,
  value,
  onChange,
  maxFiles = 5,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  // Track storage paths agar bisa delete
  const [storedImages, setStoredImages] = useState<StoredImage[]>(() =>
    value.map((url) => ({ url, path: '' })),
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxFiles - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    // Buat placeholder upload
    const placeholders: UploadingFile[] = toUpload.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      preview: URL.createObjectURL(f),
      progress: 0,
    }));
    setUploading((prev) => [...prev, ...placeholders]);

    await Promise.allSettled(
      toUpload.map(async (file, i) => {
        const placeholder = placeholders[i];
        try {
          const result = await uploadConcertImage(
            concertId || `temp-${Date.now()}`,
            file,
            (pct) => {
              setUploading((prev) =>
                prev.map((u) => (u.id === placeholder.id ? { ...u, progress: pct } : u)),
              );
            },
          );

          // Simpan ke stored + notify parent
          setStoredImages((prev) => [...prev, result]);
          onChange([...value, result.url]);

          // Hapus placeholder
          setUploading((prev) => prev.filter((u) => u.id !== placeholder.id));
          URL.revokeObjectURL(placeholder.preview);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload gagal';
          setUploading((prev) =>
            prev.map((u) =>
              u.id === placeholder.id ? { ...u, error: msg, progress: 0 } : u,
            ),
          );
        }
      }),
    );
  };

  const handleRemove = async (url: string) => {
    const stored = storedImages.find((s) => s.url === url);
    if (stored?.path) {
      try {
        await deleteConcertImage(stored.path);
      } catch {
        // Lanjutkan meski delete storage gagal
      }
    }
    setStoredImages((prev) => prev.filter((s) => s.url !== url));
    onChange(value.filter((u) => u !== url));
  };

  const handleRemoveError = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  };

  const canUpload = value.length + uploading.filter((u) => !u.error).length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Preview gambar yang sudah terupload */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Poster ${i + 1}`}
                className="w-28 h-40 object-cover rounded-lg border border-gray-200 bg-gray-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/112x160/f3f4f6/9ca3af?text=Error';
                }}
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Hapus gambar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Gambar sedang diupload */}
      {uploading.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {uploading.map((u) => (
            <div key={u.id} className="relative w-28 h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <img src={u.preview} alt={u.name} className="w-full h-full object-cover opacity-50" />
              {u.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-2 text-center">
                  <p className="text-red-600 text-[10px] leading-tight">{u.error}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveError(u.id)}
                    className="mt-1.5 text-[10px] text-red-500 underline"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-200"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{u.progress}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tombol upload */}
      {canUpload && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            onClick={(e) => {
              // Reset agar file yang sama bisa dipilih lagi
              (e.target as HTMLInputElement).value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Gambar ({value.length}/{maxFiles})
          </button>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            JPG, PNG, WebP, GIF · Maks 5MB per file · Gambar pertama = cover
          </p>
        </div>
      )}

      {!canUpload && (
        <p className="text-xs text-gray-400 text-center">
          Maksimal {maxFiles} gambar tercapai.
        </p>
      )}
    </div>
  );
}
