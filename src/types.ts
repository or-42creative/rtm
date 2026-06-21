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

  /** Moderation. Missing/`active` = counts normally; `disqualified` = excluded
   *  from points, dashboard and the wall. */
  status?: RtmStatus;
  /** Admin's reason for disqualifying. */
  dqReason?: string;
  /** Appeal lifecycle by the RTM's creator. */
  appealStatus?: AppealStatus;
  appealReason?: string;
}

export type RtmStatus = "active" | "disqualified";
export type AppealStatus = "none" | "pending" | "accepted" | "rejected";

/** A "יש לי טענה" complaint raised by any user about an RTM. */
export type ClaimCategory = "not_rtm" | "wrong_credit" | "other";
export interface Claim {
  id: string;
  rtmId: string;
  rtmName: string;
  byUid: string;
  byEmployeeId?: string | null;
  category: ClaimCategory;
  text: string;
  status: "open" | "handled";
  createdAt: Timestamp;
}

export type NotificationType =
  | "disqualified"
  | "reinstated"
  | "appeal"
  | "appeal_accepted"
  | "appeal_rejected"
  | "claim";
export interface AppNotification {
  id: string;
  /** A specific uid, or the sentinel "__admins__" (all admins). */
  forUid: string;
  type: NotificationType;
  text: string;
  rtmId?: string | null;
  readBy?: string[];
  createdAt: Timestamp;
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
  /** "Wall of fame" collage size: columns (width) × rows (length). */
  collageCols: number;
  collageRows: number;
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
