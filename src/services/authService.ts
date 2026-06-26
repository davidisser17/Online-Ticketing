// ============================================================
// Concert Ticket Jastip — Auth Service (Firebase)
// ============================================================

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Login dengan email dan password (Firebase Auth).
 * CMS login page menerima "username" tapi di Firebase pakai email.
 * Konvensi: username = bagian sebelum @ dari email admin.
 * Contoh: username "admin" → email "admin@jastiptiket.com"
 */
export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<{ token: string; user: { id: string; username: string } }> => {
  // Coba login langsung sebagai email jika username mengandung @
  const email = credentials.username.includes('@')
    ? credentials.username
    : `${credentials.username}@jastiptiket.com`;

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    credentials.password,
  );

  const token = await userCredential.user.getIdToken();
  const username =
    userCredential.user.email?.split('@')[0] ?? credentials.username;

  return {
    token,
    user: {
      id: userCredential.user.uid,
      username,
    },
  };
};

/**
 * Logout dari Firebase Auth.
 */
export const logout = () => signOut(auth);

/**
 * Refresh Firebase ID token (berlaku 1 jam, perlu di-refresh).
 */
export const refreshToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(true);
};

/**
 * Subscribe ke perubahan auth state.
 */
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
