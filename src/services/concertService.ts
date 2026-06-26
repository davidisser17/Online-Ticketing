// ============================================================
// Concert Ticket Jastip — Concert Service (Firestore)
// ============================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Concert, ConcertStatus } from '@/types';

const COLLECTION = 'concerts';

// ── Helpers ───────────────────────────────────────────────────────────────

function fromFirestore(id: string, data: Record<string, unknown>): Concert {
  return {
    ...(data as Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : String(data.createdAt ?? ''),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : String(data.updatedAt ?? ''),
  };
}

// ── Public ────────────────────────────────────────────────────────────────

export async function getConcerts(params?: {
  status?: string[];
}): Promise<{ data: { data: Concert[] } }> {
  const ref = collection(db, COLLECTION);
  let q;

  if (params?.status && params.status.length > 0) {
    // Gunakan where saja tanpa orderBy untuk menghindari kebutuhan composite index
    q = query(ref, where('status', 'in', params.status));
  } else {
    q = query(ref);
  }

  const snap = await getDocs(q);
  const concerts = snap.docs
    .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
    // Sort by date ascending di client-side
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { data: { data: concerts } };
}

export async function getConcertById(
  id: string,
): Promise<{ data: { data: Concert } }> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error('Konser tidak ditemukan');

  return {
    data: { data: fromFirestore(snap.id, snap.data() as Record<string, unknown>) },
  };
}

// ── CMS ───────────────────────────────────────────────────────────────────

export type ConcertPayload = Omit<Concert, 'id' | 'createdAt' | 'updatedAt' | 'interestCount' | 'remainingQuota'>;

export async function createConcert(
  payload: ConcertPayload,
): Promise<{ data: { data: Concert } }> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    interestCount: 0,
    remainingQuota: payload.quota,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(ref);
  return {
    data: {
      data: fromFirestore(snap.id, snap.data() as Record<string, unknown>),
    },
  };
}

export async function updateConcert(
  id: string,
  payload: Partial<ConcertPayload & { status: ConcertStatus }>,
): Promise<{ data: { data: Concert } }> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  return {
    data: {
      data: fromFirestore(snap.id, snap.data() as Record<string, unknown>),
    },
  };
}

export async function deleteConcert(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
