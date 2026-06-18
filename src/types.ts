import type { Timestamp } from "firebase/firestore";

export interface Employee {
  id: string;
  name: string;
  active: boolean;
  /** Lower-cased Google account email, linked on first login or by an admin. */
  email?: string | null;
}

export interface Client {
  id: string;
  name: string;
  /** Employee.id of the account manager ("מנהל/ת לקוח"). */
  accountManagerId: string;
  active: boolean;
}

export type MediaType = "image" | "video" | "embed" | "none";

export interface Rtm {
  id: string;
  name: string;
  clientId: string;
  /** Denormalized for display + resilience to client renames. */
  clientName: string;
  /** 1–2 idea owners (Employee.id). */
  ideaOwnerIds: string[];
  /** Denormalized from the client at creation time (Employee.id). */
  accountManagerId: string;
  /** Link to the post on social. */
  link: string;
  mediaType: MediaType;
  /** Uploaded file URL (Storage) or a thumbnail. */
  mediaUrl?: string | null;
  /** Canonical link used for oEmbed rendering. */
  embedUrl?: string | null;
  /** The date the RTM went live. */
  date: Timestamp;
  /** "YYYY-MM" derived from `date`, for fast monthly grouping. */
  monthKey: string;
  createdByUid: string;
  createdByEmployeeId?: string | null;
  createdAt: Timestamp;
  /** uid → true for everyone who hearted this RTM. */
  reactions?: Record<string, boolean>;
}

export type UserRole = "admin" | "member";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  /** Linked Employee.id, so a logged-in account maps to an employee record. */
  employeeId?: string | null;
  role: UserRole;
  createdAt: Timestamp;
}

export type DigestFrequency = "weekly" | "biweekly" | "monthly";

/** Admin-editable copy shown around the app. */
export interface AppContent {
  /** "הפרס של החודש" — shown on the dashboard. */
  monthlyPrize: string;
  /** Optional banner shown at the top of the dashboard. */
  announcement: string;
  /** The competition rules (markdown-ish). Empty → the built-in default. */
  rules: string;
  /** Per-key overrides for UI strings (see data/strings.ts); missing → default. */
  strings: Record<string, string>;
}

export interface AppSettings {
  emailDigest: {
    enabled: boolean;
    frequency: DigestFrequency;
    recipients: string[];
  };
  content: AppContent;
  /** Max idea owners allowed per RTM (admin-configurable; default 2). */
  maxIdeaOwners: number;
}

/** A row in a monthly leaderboard. */
export interface ScoreRow {
  employeeId: string;
  name: string;
  count: number;
}

/** The two monthly winners. */
export interface MonthWinners {
  monthKey: string;
  topIdea: ScoreRow | null;
  topAccountManager: ScoreRow | null;
}
