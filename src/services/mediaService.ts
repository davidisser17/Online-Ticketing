// ============================================================
// Concert Ticket Jastip — Media Service (Firebase Storage)
// ============================================================

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload satu file gambar ke Firebase Storage.
 * Return download URL dan storage path.
 */
export async function uploadConcertImage(
  concertId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(`Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.`);
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `concerts/${concertId}/${filename}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        onProgress?.(pct);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path });
      },
    );
  });
}

/**
 * Hapus gambar dari Firebase Storage berdasarkan path.
 */
export async function deleteConcertImage(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}
