// ============================================================
// Concert Ticket Jastip — Interest Service (Firestore)
// ============================================================

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Interest } from '@/types';

export interface InterestFormData {
  fullName: string;
  whatsapp: string;
  email: string;
}

export async function registerInterest(
  concertId: string,
  data: InterestFormData,
): Promise<{ data: { data: Interest } }> {
  // Cek duplikat whatsapp atau email di konser yang sama
  const q = query(
    collection(db, 'interests'),
    where('concertId', '==', concertId),
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const e = d.data();
    return e.whatsapp === data.whatsapp || e.email === data.email;
  });

  if (existing) {
    const e = existing.data();
    const err = Object.assign(new Error('Sudah terdaftar'), {
      response: {
        status: 409,
        data: {
          errors: {
            whatsapp: e.whatsapp === data.whatsapp ? ['Nomor sudah terdaftar'] : [],
            email: e.email === data.email ? ['Email sudah terdaftar'] : [],
          },
        },
      },
    });
    throw err;
  }

  const ref = await addDoc(collection(db, 'interests'), {
    concertId,
    ...data,
    createdAt: serverTimestamp(),
  });

  // interestCount = tiket terjual (quota - remainingQuota), bukan jumlah pendaftar minat
  // Jadi registerInterest TIDAK increment interestCount

  const interest: Interest = {
    id: ref.id,
    concertId,
    ...data,
    createdAt: new Date().toISOString(),
  };

  return { data: { data: interest } };
}
