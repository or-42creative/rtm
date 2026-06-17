import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db, googleProvider, isAllowedEmail, allowedDomains } from "./firebase";
import { COL, ensureUserDoc } from "./db";
import type { AppUser } from "@/types";

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the Firebase auth session.
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAppUser(null);
        setLoading(false);
      }
    });
  }, []);

  // Once signed in, make sure the user doc exists and then keep it live so role
  // / employee-link changes from the admin panel show up immediately.
  useEffect(() => {
    if (!firebaseUser) return;
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      try {
        await ensureUserDoc(firebaseUser);
        if (cancelled) return;
        unsub = onSnapshot(doc(db, COL.users, firebaseUser.uid), (snap) => {
          setAppUser(
            snap.exists()
              ? ({ uid: snap.id, ...(snap.data() as object) } as AppUser)
              : null,
          );
          setLoading(false);
        });
      } catch (e) {
        console.error(e);
        setError("אירעה שגיאה בטעינת המשתמש. נסו שוב.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [firebaseUser]);

  const signIn = async () => {
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!isAllowedEmail(cred.user.email)) {
        await fbSignOut(auth);
        setError(
          `אפשר להתחבר רק עם חשבון של ${allowedDomains.join(" / ") || "המשרד"}.`,
        );
      }
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return; // user closed the popup — not an error worth showing
      }
      console.error(e);
      setError("ההתחברות נכשלה. נסו שוב.");
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, error, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
