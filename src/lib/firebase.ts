import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// Always show the account chooser so people don't get auto-signed into a
// personal Google account.
googleProvider.setCustomParameters({ prompt: "select_account" });

const splitList = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Google accounts must belong to one of these email domains to sign in. */
export const allowedDomains = splitList(import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS);

/** Emails that are granted the admin role automatically on first login. */
export const bootstrapAdminEmails = splitList(
  import.meta.env.VITE_BOOTSTRAP_ADMIN_EMAILS,
);

export const emailDomain = (email: string | null | undefined): string =>
  (email ?? "").split("@")[1]?.toLowerCase() ?? "";

export const isAllowedEmail = (email: string | null | undefined): boolean =>
  allowedDomains.length === 0 || allowedDomains.includes(emailDomain(email));

/** True if Firebase config is actually filled in (vs. the empty .env template). */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
