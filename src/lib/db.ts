import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db, bootstrapAdminEmails } from "./firebase";
import { monthKeyOf } from "./scores";
import { SEED_EMPLOYEES, SEED_CLIENTS } from "@/data/seed";
import { DEFAULT_CONTENT } from "@/data/content";
import type {
  AppUser,
  AppSettings,
  Client,
  Employee,
  MediaType,
  Rtm,
} from "@/types";

export const COL = {
  employees: "employees",
  clients: "clients",
  rtms: "rtms",
  users: "users",
  settings: "settings",
} as const;

const SETTINGS_DOC = "app";

export const DEFAULT_SETTINGS: AppSettings = {
  emailDigest: { enabled: false, frequency: "monthly", recipients: [] },
  content: DEFAULT_CONTENT,
  maxIdeaOwners: 2,
};

type Snap = QueryDocumentSnapshot<DocumentData>;
const withId = <T,>(s: Snap): T => ({ id: s.id, ...(s.data() as object) }) as T;

/* ----------------------------- live subscriptions ----------------------------- */

export const subscribeEmployees = (cb: (rows: Employee[]) => void) =>
  onSnapshot(query(collection(db, COL.employees), orderBy("name")), (snap) =>
    cb(snap.docs.map((d) => withId<Employee>(d))),
  );

export const subscribeClients = (cb: (rows: Client[]) => void) =>
  onSnapshot(query(collection(db, COL.clients), orderBy("name")), (snap) =>
    cb(snap.docs.map((d) => withId<Client>(d))),
  );

export const subscribeRtms = (cb: (rows: Rtm[]) => void) =>
  onSnapshot(query(collection(db, COL.rtms), orderBy("date", "desc")), (snap) =>
    cb(snap.docs.map((d) => withId<Rtm>(d))),
  );

export const subscribeUsers = (cb: (rows: AppUser[]) => void) =>
  onSnapshot(collection(db, COL.users), (snap) =>
    cb(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as object) }) as AppUser)),
  );

export const subscribeSettings = (cb: (s: AppSettings) => void) =>
  onSnapshot(doc(db, COL.settings, SETTINGS_DOC), (snap) => {
    const data = (snap.data() ?? {}) as Partial<AppSettings>;
    cb({
      emailDigest: { ...DEFAULT_SETTINGS.emailDigest, ...data.emailDigest },
      content: { ...DEFAULT_CONTENT, ...data.content },
      maxIdeaOwners: data.maxIdeaOwners ?? DEFAULT_SETTINGS.maxIdeaOwners,
    });
  });

/* --------------------------------- users/auth -------------------------------- */

/**
 * Create the user's doc on first login (or return the existing one). The first
 * admin(s) are whoever is listed in VITE_BOOTSTRAP_ADMIN_EMAILS; everyone else
 * starts as a member. If an employee record already carries this email, we link
 * them automatically.
 */
export async function ensureUserDoc(user: User): Promise<AppUser> {
  const refDoc = doc(db, COL.users, user.uid);
  const existing = await getDoc(refDoc);
  const email = (user.email ?? "").toLowerCase();

  if (existing.exists()) {
    return { uid: user.uid, ...(existing.data() as object) } as AppUser;
  }

  // New account: members start unlinked and pick "who am I" once (see the
  // app shell). Admins are bootstrapped from VITE_BOOTSTRAP_ADMIN_EMAILS.
  const role = bootstrapAdminEmails.includes(email) ? "admin" : "member";
  const newUser: Omit<AppUser, "uid"> = {
    email,
    displayName: user.displayName ?? email,
    photoURL: user.photoURL ?? null,
    employeeId: null,
    role,
    createdAt: serverTimestamp() as unknown as Timestamp,
  };
  await setDoc(refDoc, newUser);
  return { uid: user.uid, ...newUser };
}

/** Link a logged-in account to an employee record. Recorded on the user doc so
 *  members can self-link without write access to the employees collection. */
export async function linkEmployeeToUser(
  uid: string,
  employeeId: string,
): Promise<void> {
  await updateDoc(doc(db, COL.users, uid), { employeeId });
}

export const setUserRole = (uid: string, role: AppUser["role"]) =>
  updateDoc(doc(db, COL.users, uid), { role });

export const setUserEmployee = (uid: string, employeeId: string | null) =>
  updateDoc(doc(db, COL.users, uid), { employeeId });

export const deleteUser = (uid: string) => deleteDoc(doc(db, COL.users, uid));

/* ---------------------------------- RTMs ------------------------------------- */

export interface NewRtmInput {
  name: string;
  clientId: string;
  clientName: string;
  ideaOwnerIds: string[];
  accountManagerId: string;
  link: string;
  mediaType: MediaType;
  mediaUrl?: string | null;
  embedUrl?: string | null;
  date: Date;
  createdByUid: string;
  createdByEmployeeId?: string | null;
}

export async function createRtm(input: NewRtmInput): Promise<string> {
  const { date, ...rest } = input;
  const docRef = await addDoc(collection(db, COL.rtms), {
    ...rest,
    date: Timestamp.fromDate(date),
    monthKey: monthKeyOf(date),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRtm(
  id: string,
  input: Omit<NewRtmInput, "createdByUid" | "createdByEmployeeId">,
): Promise<void> {
  const { date, ...rest } = input;
  await updateDoc(doc(db, COL.rtms, id), {
    ...rest,
    date: Timestamp.fromDate(date),
    monthKey: monthKeyOf(date),
  });
}

export const deleteRtm = (id: string) => deleteDoc(doc(db, COL.rtms, id));

/** Toggle the current user's ❤️ on an RTM (stored as reactions[uid] = true). */
export const toggleReaction = (rtmId: string, uid: string, liked: boolean) =>
  updateDoc(doc(db, COL.rtms, rtmId), {
    [`reactions.${uid}`]: liked ? true : deleteField(),
  });

/* ------------------------------- admin: employees ----------------------------- */

export const addEmployee = (name: string, email?: string) =>
  addDoc(collection(db, COL.employees), {
    name: name.trim(),
    active: true,
    email: email?.trim().toLowerCase() || null,
  });

export const updateEmployee = (id: string, patch: Partial<Employee>) =>
  updateDoc(doc(db, COL.employees, id), patch);

export const setEmployeeActive = (id: string, active: boolean) =>
  updateDoc(doc(db, COL.employees, id), { active });

/* -------------------------------- admin: clients ------------------------------ */

export const addClient = (name: string, accountManagerId: string) =>
  addDoc(collection(db, COL.clients), {
    name: name.trim(),
    accountManagerId,
    active: true,
  });

export const updateClient = (id: string, patch: Partial<Client>) =>
  updateDoc(doc(db, COL.clients, id), patch);

export const setClientActive = (id: string, active: boolean) =>
  updateDoc(doc(db, COL.clients, id), { active });

/* -------------------------------- admin: settings ----------------------------- */

export const saveSettings = (settings: AppSettings) =>
  setDoc(doc(db, COL.settings, SETTINGS_DOC), settings, { merge: true });

/* ---------------------------------- seeding ---------------------------------- */

/**
 * Write the office's employees + clients into Firestore. Idempotent: uses the
 * stable seed ids, so running it again refreshes the same docs (it never wipes
 * email links or the `active` flag — those use merge).
 */
export async function seedData(): Promise<void> {
  const batch = writeBatch(db);
  for (const e of SEED_EMPLOYEES) {
    batch.set(
      doc(db, COL.employees, e.id),
      { name: e.name, active: true, ...(e.email ? { email: e.email.toLowerCase() } : {}) },
      { merge: true },
    );
  }
  for (const c of SEED_CLIENTS) {
    batch.set(
      doc(db, COL.clients, c.id),
      { name: c.name, accountManagerId: c.accountManagerId, active: true },
      { merge: true },
    );
  }
  await batch.commit();
}
