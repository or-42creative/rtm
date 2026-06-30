import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
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
  AppNotification,
  AppSettings,
  Claim,
  ClaimCategory,
  ClaimResolution,
  Client,
  ContentType,
  Employee,
  MediaType,
  NotificationType,
  Rtm,
} from "@/types";

export const COL = {
  employees: "employees",
  clients: "clients",
  rtms: "rtms",
  users: "users",
  settings: "settings",
  claims: "claims",
  notifications: "notifications",
} as const;

/** Notification target sentinel = "all admins". */
export const ADMINS = "__admins__";

const SETTINGS_DOC = "app";

export const DEFAULT_SETTINGS: AppSettings = {
  emailDigest: { enabled: false, frequency: "monthly", recipients: [] },
  content: DEFAULT_CONTENT,
  maxIdeaOwners: 2,
  typePoints: { comment: 1, post: 2, video: 3 },
  collageCols: 4,
  collageRows: 4,
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
      typePoints: { ...DEFAULT_SETTINGS.typePoints, ...data.typePoints },
      collageCols: data.collageCols ?? DEFAULT_SETTINGS.collageCols,
      collageRows: data.collageRows ?? DEFAULT_SETTINGS.collageRows,
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
  contentType: ContentType;
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

/* ------------------------------ moderation (admin) --------------------------- */

export const disqualifyRtm = (id: string, reason: string) =>
  updateDoc(doc(db, COL.rtms, id), {
    status: "disqualified",
    dqReason: reason.trim(),
    appealStatus: "none",
    appealReason: "",
  });

export const reinstateRtm = (id: string) =>
  updateDoc(doc(db, COL.rtms, id), { status: "active", appealStatus: "none" });

/** Admin's verdict on a pending appeal. */
export const resolveAppeal = (id: string, accept: boolean) =>
  accept
    ? updateDoc(doc(db, COL.rtms, id), { status: "active", appealStatus: "accepted" })
    : updateDoc(doc(db, COL.rtms, id), { appealStatus: "rejected" });

/** The RTM's creator appeals a disqualification. */
export const appealRtm = (id: string, reason: string) =>
  updateDoc(doc(db, COL.rtms, id), {
    appealStatus: "pending",
    appealReason: reason.trim(),
  });

/* -------------------------------- claims ------------------------------------- */

export interface NewClaim {
  rtmId: string;
  rtmName: string;
  byUid: string;
  byEmployeeId?: string | null;
  category: ClaimCategory;
  text: string;
}

export const createClaim = (c: NewClaim) =>
  addDoc(collection(db, COL.claims), {
    ...c,
    byEmployeeId: c.byEmployeeId ?? null,
    status: "open",
    createdAt: serverTimestamp(),
  });

export const subscribeClaims = (cb: (rows: Claim[]) => void) =>
  onSnapshot(query(collection(db, COL.claims), orderBy("createdAt", "desc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Claim)),
  );

export const resolveClaim = (
  id: string,
  resolution: ClaimResolution,
  adminNote: string,
) =>
  updateDoc(doc(db, COL.claims, id), {
    status: "handled",
    resolution,
    adminNote: adminNote.trim(),
  });

/* ----------------------------- notifications --------------------------------- */

export const createNotification = (n: {
  forUid: string;
  type: NotificationType;
  text: string;
  rtmId?: string | null;
}) =>
  addDoc(collection(db, COL.notifications), {
    forUid: n.forUid,
    type: n.type,
    text: n.text,
    rtmId: n.rtmId ?? null,
    readBy: [],
    createdAt: serverTimestamp(),
  });

export const notifyAdmins = (type: NotificationType, text: string, rtmId?: string) =>
  createNotification({ forUid: ADMINS, type, text, rtmId });

export const subscribeNotifications = (
  uid: string,
  isAdmin: boolean,
  cb: (rows: AppNotification[]) => void,
) =>
  onSnapshot(
    query(
      collection(db, COL.notifications),
      where("forUid", "in", isAdmin ? [uid, ADMINS] : [uid]),
      orderBy("createdAt", "desc"),
      limit(40),
    ),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as AppNotification)),
  );

export const markNotificationRead = (id: string, uid: string) =>
  updateDoc(doc(db, COL.notifications, id), { readBy: arrayUnion(uid) });

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
