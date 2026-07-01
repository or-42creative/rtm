import type {
  Rtm,
  Employee,
  Client,
  ContentType,
  ScoreRow,
  MonthWinners,
} from "@/types";
import { DEFAULT_CONTENT_TYPE } from "@/data/contentTypes";

/** Fallback when no settings are supplied (matches DEFAULT_SETTINGS). */
const DEFAULT_TYPE_POINTS: Record<ContentType, number> = {
  comment: 1,
  post: 2,
  video: 3,
};

/** Type-based points start this month (inclusive). Anything earlier is legacy,
 *  unclassified content and is worth a flat 1 point each (the "old" scoring). */
export const TYPE_POINTS_FROM = "2026-07";

/**
 * How many points a single RTM is worth to each person credited on it (idea
 * owner or account manager alike). From July 2026 this is the content-type
 * value (comment/post/video); before that, every RTM is a flat 1 point because
 * older content was never classified.
 */
export function rtmPoints(
  r: Rtm,
  typePoints: Record<ContentType, number> = DEFAULT_TYPE_POINTS,
): number {
  if (r.monthKey < TYPE_POINTS_FROM) return 1;
  return typePoints[r.contentType ?? DEFAULT_CONTENT_TYPE] ?? 1;
}

const HE_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

/** "YYYY-MM" for a Date (local time). */
export const monthKeyOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const currentMonthKey = (): string => monthKeyOf(new Date());

/** The month key immediately before the given one. */
export const prevMonthKey = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  return monthKeyOf(new Date(y, m - 2, 1));
};

/** Human label, e.g. "יוני 2026". */
export const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  return `${HE_MONTHS[m - 1]} ${y}`;
};

const HE_MONTHS_SHORT = [
  "ינו׳",
  "פבר׳",
  "מרץ",
  "אפר׳",
  "מאי",
  "יוני",
  "יולי",
  "אוג׳",
  "ספט׳",
  "אוק׳",
  "נוב׳",
  "דצמ׳",
];

/** Short month label for charts, e.g. "יוני". */
export const shortMonthLabel = (key: string): string => {
  const m = Number(key.split("-")[1]);
  return HE_MONTHS_SHORT[m - 1];
};

/** The N month keys ending at (and including) `endKey`, oldest first. */
export const lastMonths = (endKey: string, n: number): string[] => {
  const keys: string[] = [];
  let k = endKey;
  for (let i = 0; i < n; i++) {
    keys.unshift(k);
    k = prevMonthKey(k);
  }
  return keys;
};

export const daysInMonth = (key: string): number => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
  title?: string;
}

const toDate = (ts: unknown): Date | null =>
  ts && typeof (ts as { toDate?: unknown }).toDate === "function"
    ? (ts as { toDate: () => Date }).toDate()
    : null;

/** RTMs per day across a month — the "pace" chart. Sparse day labels. */
export function dailyCounts(allRtms: Rtm[], monthKey: string): BarDatum[] {
  const days = daysInMonth(monthKey);
  const counts = new Array(days + 1).fill(0) as number[];
  for (const r of allRtms) {
    if (r.monthKey !== monthKey || r.status === "disqualified") continue;
    const d = toDate(r.date);
    if (d) counts[d.getDate()] += 1;
  }
  const todayDay = new Date().getDate();
  const isCurrent = monthKey === currentMonthKey();
  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const show = day === 1 || day % 5 === 0 || day === days;
    return {
      label: show ? String(day) : "",
      value: counts[day],
      highlight: isCurrent && day === todayDay,
      title: `${day} בחודש · ${counts[day]} RTM`,
    };
  });
}

const sortRows = (rows: ScoreRow[]): ScoreRow[] =>
  [...rows].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "he"));

export interface MonthScores {
  monthKey: string;
  rtmCount: number;
  /** Points for bringing ideas — each RTM is worth its content-type points. */
  ideaScores: ScoreRow[];
  /** RTMs per account manager. */
  amScores: ScoreRow[];
  /** Combined tally: idea + account-manager, but never double for the same
   *  RTM (if the idea owner is also that client's account manager → 1, not 2). */
  totalPoints: ScoreRow[];
  topClient: { clientId: string; name: string; count: number } | null;
  winners: MonthWinners;
}

/**
 * Compute every monthly tally from the raw RTM records. Pure function — no
 * Firestore, easy to reason about and matches the confirmed rules:
 *   • each idea owner (up to 2) earns a point
 *   • the client's account manager earns a point
 *   • if an idea owner is also that client's account manager, they get a single
 *     point for that RTM, not two
 *   • two monthly winners: most idea points, and the account manager with the
 *     most RTMs
 */
export function computeMonthScores(
  allRtms: Rtm[],
  monthKey: string,
  employees: Employee[],
  clients: Client[],
  typePoints: Record<ContentType, number> = DEFAULT_TYPE_POINTS,
): MonthScores {
  const pointsOf = (r: Rtm): number => rtmPoints(r, typePoints);
  const nameOf = new Map(employees.map((e) => [e.id, e.name] as const));
  const clientName = new Map(clients.map((c) => [c.id, c.name] as const));
  const isAccountManager = new Set(clients.map((c) => c.accountManagerId));

  const rtms = allRtms.filter(
    (r) => r.monthKey === monthKey && r.status !== "disqualified",
  );

  const idea = new Map<string, number>();
  const am = new Map<string, number>();
  const total = new Map<string, number>();
  const clientCount = new Map<string, number>();

  const bump = (m: Map<string, number>, id: string, by = 1) =>
    m.set(id, (m.get(id) ?? 0) + by);

  for (const r of rtms) {
    const p = pointsOf(r);
    const owners = new Set(r.ideaOwnerIds.filter(Boolean));
    for (const ownerId of owners) {
      bump(idea, ownerId, p);
      bump(total, ownerId, p);
    }
    if (r.accountManagerId) {
      // Account managers earn the same content points as idea owners.
      bump(am, r.accountManagerId, p);
      // Only add account-manager points to the combined total if they didn't
      // already earn them as an idea owner on this same RTM (no double).
      if (!owners.has(r.accountManagerId)) bump(total, r.accountManagerId, p);
    }
    if (r.clientId) bump(clientCount, r.clientId);
  }

  const toRows = (m: Map<string, number>, onlyAMs = false): ScoreRow[] =>
    sortRows(
      [...m.entries()]
        .filter(([id]) => (onlyAMs ? isAccountManager.has(id) : true))
        .map(([employeeId, count]) => ({
          employeeId,
          name: nameOf.get(employeeId) ?? "—",
          count,
        })),
    );

  const ideaScores = toRows(idea);
  const amScores = toRows(am, true);

  let topClient: MonthScores["topClient"] = null;
  for (const [clientId, count] of clientCount) {
    if (!topClient || count > topClient.count) {
      topClient = { clientId, name: clientName.get(clientId) ?? "—", count };
    }
  }

  const winners: MonthWinners = {
    monthKey,
    topIdea: ideaScores[0] ?? null,
    topAccountManager: amScores[0] ?? null,
  };

  return {
    monthKey,
    rtmCount: rtms.length,
    ideaScores,
    amScores,
    totalPoints: toRows(total),
    topClient,
    winners,
  };
}
