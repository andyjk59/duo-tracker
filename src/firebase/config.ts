import { initializeApp } from "firebase/app";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey);

// Without real Firebase credentials (.env.local not set up yet), skip
// initializing the SDK entirely — getAuth() throws synchronously on a
// missing/placeholder API key, which would crash the whole app at import time.
export const app = firebaseConfigured ? initializeApp(firebaseConfig) : undefined;
// ignoreUndefinedProperties: optional fields (e.g. photoURL when no photo was
// attached) are passed through as `undefined` by call sites — Firestore's
// default setDoc() throws on that, so this makes it silently omit them instead.
export const db = app ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : undefined;
export const auth = app ? getAuth(app) : undefined;

/** Throws if Firebase isn't configured — call only from code paths already gated on firebaseConfigured. */
export function requireDb(): Firestore {
  if (!db) throw new Error("Firestore is not configured yet (.env.local is empty).");
  return db;
}

/** Resolves once anonymous sign-in completes, so Firestore/Storage calls are authorized. */
export function ensureSignedIn(): Promise<void> {
  if (!auth) {
    console.warn("Firebase is not configured yet (.env.local is empty) — running with no backend connection.");
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve();
        return;
      }
      signInAnonymously(auth).then(() => resolve()).catch(reject);
    });
  });
}
