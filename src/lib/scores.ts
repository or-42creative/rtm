import type {
  Rtm,
  Employee,
  Client,
  ScoreRow,
  MonthWinners,
} from "@/types";

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

const sortRows = (rows: ScoreRow[]): ScoreRow[] =>
  [...rows].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "he"));

export interface MonthScores {
  monthKey: string;
  rtmCount: number;
  /** Points for bringing ideas (one per idea-owner appearance). */
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
): MonthScores {
  const nameOf = new Map(employees.map((e) => [e.id, e.name] as const));
  const clientName = new Map(clients.map((c) => [c.id, c.name] as const));
  const isAccountManager = new Set(clients.map((c) => c.accountManagerId));

  const rtms = allRtms.filter((r) => r.monthKey === monthKey);

  const idea = new Map<string, number>();
  const am = new Map<string, number>();
  const total = new Map<string, number>();
  const clientCount = new Map<string, number>();

  const bump = (m: Map<string, number>, id: string, by = 1) =>
    m.set(id, (m.get(id) ?? 0) + by);

  for (const r of rtms) {
    const owners = new Set(r.ideaOwnerIds.filter(Boolean));
    for (const ownerId of owners) {
      bump(idea, ownerId);
      bump(total, ownerId);
    }
    if (r.accountManagerId) {
      bump(am, r.accountManagerId);
      // Only add an account-manager point if they didn't already earn one as
      // an idea owner on this same RTM.
      if (!owners.has(r.accountManagerId)) bump(total, r.accountManagerId);
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
