import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import {
  addClient,
  addEmployee,
  createNotification,
  deleteRtm,
  deleteUser,
  disqualifyRtm,
  reinstateRtm,
  resolveAppeal,
  setClaimHandled,
  subscribeClaims,
  DEFAULT_SETTINGS,
  saveSettings,
  seedData,
  setClientActive,
  setEmployeeActive,
  setUserEmployee,
  setUserRole,
  subscribeSettings,
  subscribeUsers,
  updateClient,
  updateEmployee,
} from "@/lib/db";
import type { AppSettings, AppUser, Claim, DigestFrequency } from "@/types";
import { DEFAULT_RULES_MD } from "@/data/content";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  SectionTitle,
  cn,
  inputClass,
  selectInline,
} from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";
import {
  RtmFilterBar,
  applyRtmFilter,
  defaultRtmFilter,
} from "@/components/RtmFilters";
import { DEFAULT_STRINGS, STRING_GROUPS } from "@/data/strings";

type Tab =
  | "users"
  | "employees"
  | "clients"
  | "rtms"
  | "claims"
  | "content"
  | "strings"
  | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "users", label: "משתמשים" },
  { id: "employees", label: "עובדים" },
  { id: "clients", label: "לקוחות" },
  { id: "rtms", label: "RTMים" },
  { id: "claims", label: "טענות" },
  { id: "content", label: "תוכן" },
  { id: "strings", label: "טקסטים" },
  { id: "settings", label: "הגדרות" },
];

export function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  return (
    <div>
      <h1 className="text-2xl font-black">ניהול</h1>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-bold transition",
              tab === t.id
                ? "border-b-2 border-[var(--color-ink)] text-[var(--color-ink)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "users" && <UsersTab />}
        {tab === "employees" && <EmployeesTab />}
        {tab === "clients" && <ClientsTab />}
        {tab === "rtms" && <RtmsTab />}
        {tab === "claims" && <ClaimsTab />}
        {tab === "content" && <ContentTab />}
        {tab === "strings" && <StringsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

/* --------------------------------- inline edit -------------------------------- */

function InlineEdit({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("font-bold", !value && "text-[var(--color-ink-soft)]")}>
          {value || "—"}
        </span>
        <button
          onClick={() => {
            setV(value);
            setEditing(true);
          }}
          className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          aria-label="עריכה"
        >
          ✎
        </button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        autoFocus
        className={cn(inputClass, "h-8 w-44 py-1")}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            onSave(v.trim());
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <button
        onClick={() => {
          if (v.trim()) onSave(v.trim());
          setEditing(false);
        }}
        className="text-sm font-bold text-green-600"
      >
        ✓
      </button>
      <button onClick={() => setEditing(false)} className="text-sm text-[var(--color-ink-soft)]">
        ✕
      </button>
    </span>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] py-3 last:border-0">
      {children}
    </div>
  );
}

/* ----------------------------------- users ----------------------------------- */

function UsersTab() {
  const { appUser } = useAuth();
  const { employees, employeeName } = useAppData();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => subscribeUsers(setUsers), []);

  return (
    <Card>
      <SectionTitle hint={`${users.length} משתמשים`}>משתמשים מחוברים</SectionTitle>
      <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
        משתמשים נוצרים אוטומטית בכניסה הראשונה. כאן אפשר לשייך אותם לעובד, להפוך
        למנהל מערכת או להסיר.
      </p>
      {users.length === 0 ? (
        <EmptyState title="אין עדיין משתמשים" />
      ) : (
        users
          .slice()
          .sort((a, b) => (a.displayName ?? "").localeCompare(b.displayName ?? "", "he"))
          .map((u) => {
            const isSelf = u.uid === appUser?.uid;
            return (
              <Row key={u.uid}>
                <div className="min-w-0 flex-1 basis-48">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="truncate">
                      {u.employeeId ? employeeName(u.employeeId) : u.displayName}
                    </span>
                    {u.role === "admin" && <Badge tone="accent">אדמין</Badge>}
                    {isSelf && <span className="text-xs text-[var(--color-ink-soft)]">(את/ה)</span>}
                  </div>
                  <div className="truncate text-xs text-[var(--color-ink-soft)]" dir="ltr">
                    {u.email}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className={cn(selectInline, "w-44")}
                    value={u.employeeId ?? ""}
                    onChange={(e) => void setUserEmployee(u.uid, e.target.value || null)}
                  >
                    <option value="">— לא משויך —</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    disabled={isSelf}
                    onClick={() =>
                      void setUserRole(u.uid, u.role === "admin" ? "member" : "admin")
                    }
                  >
                    {u.role === "admin" ? "הסר אדמין" : "הפוך לאדמין"}
                  </Button>

                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    disabled={isSelf}
                    onClick={() => {
                      if (confirm(`להסיר את ${u.email}?`)) void deleteUser(u.uid);
                    }}
                  >
                    הסרה
                  </Button>
                </div>
              </Row>
            );
          })
      )}
    </Card>
  );
}

/* --------------------------------- employees --------------------------------- */

function EmployeesTab() {
  const { employees } = useAppData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const add = () => {
    if (!name.trim()) return;
    void addEmployee(name, email);
    setName("");
    setEmail("");
  };

  return (
    <div className="space-y-4">
      <SeedCard />
      <Card>
        <SectionTitle hint={`${employees.filter((e) => e.active).length} פעילים`}>עובדים</SectionTitle>
        <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
          המייל משמש לשיוך אוטומטי בכניסה. הוסיפו עובד/ת חדש/ה עם המייל שלו/ה, או
          לחצו על ✎ ליד עובד כדי לעדכן מייל.
        </p>
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className={inputClass}
            placeholder="שם עובד/ת"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inputClass}
            dir="ltr"
            placeholder="email@42creative.co.il"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}>הוספה</Button>
        </div>
        {employees.map((e) => (
          <Row key={e.id}>
            <span className="min-w-0 flex-1 basis-40">
              <InlineEdit value={e.name} onSave={(v) => void updateEmployee(e.id, { name: v })} />
              {!e.active && <Badge tone="neutral">לא פעיל</Badge>}
            </span>
            <span className="text-xs text-[var(--color-ink-soft)]" dir="ltr">
              <InlineEdit
                value={e.email ?? ""}
                onSave={(v) => void updateEmployee(e.id, { email: v.toLowerCase() })}
              />
            </span>
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              onClick={() => void setEmployeeActive(e.id, !e.active)}
            >
              {e.active ? "השבתה" : "הפעלה מחדש"}
            </Button>
          </Row>
        ))}
      </Card>
    </div>
  );
}

function SeedCard() {
  const { employees, clients } = useAppData();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const seeded = employees.length > 0 || clients.length > 0;
  const withEmail = employees.filter((e) => e.email).length;

  const run = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await seedData();
      setMsg({ ok: true, text: "✓ העובדים, הלקוחות והמיילים סונכרנו בהצלחה." });
    } catch (e) {
      setMsg({
        ok: false,
        text: "❌ הסנכרון נכשל: " + (e instanceof Error ? e.message : "אין הרשאה"),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-[var(--color-cloud)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black">אתחול / סנכרון נתונים</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            טעינת רשימת העובדים, הלקוחות והמיילים מהקבצים. אפשר להריץ שוב — לא
            נוצרות כפילויות ולא נמחקים שיוכים. ({withEmail} מתוך {employees.length} עם מייל)
          </p>
        </div>
        <Button variant={seeded ? "outline" : "primary"} disabled={busy} onClick={() => void run()}>
          {busy ? "טוען…" : seeded ? "רענון מהקבצים" : "טעינת נתונים"}
        </Button>
      </div>
      {msg && (
        <p className={cn("mt-3 text-sm font-bold", msg.ok ? "text-green-600" : "text-red-600")}>
          {msg.text}
        </p>
      )}
    </Card>
  );
}

/* ---------------------------------- clients ---------------------------------- */

function ClientsTab() {
  const { clients, accountManagers, employees, employeeName } = useAppData();
  const [name, setName] = useState("");
  const [amId, setAmId] = useState("");

  // For assigning an account manager, allow any employee (not only existing AMs).
  const amChoices = employees.filter((e) => e.active);

  return (
    <Card>
      <SectionTitle hint={`${clients.filter((c) => c.active).length} פעילים`}>לקוחות</SectionTitle>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          className={inputClass}
          placeholder="שם לקוח חדש"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select className={inputClass} value={amId} onChange={(e) => setAmId(e.target.value)}>
          <option value="">מנהל/ת לקוח…</option>
          {amChoices.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            if (name.trim() && amId) {
              void addClient(name, amId);
              setName("");
              setAmId("");
            }
          }}
        >
          הוספה
        </Button>
      </div>
      {clients.map((c) => (
        <Row key={c.id}>
          <span className="me-auto">
            <InlineEdit value={c.name} onSave={(v) => void updateClient(c.id, { name: v })} />
            {!c.active && <Badge tone="neutral">לא פעיל</Badge>}
          </span>
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
            מנהל/ת:
            <select
              className={cn(selectInline, "w-40")}
              value={c.accountManagerId}
              onChange={(e) => void updateClient(c.id, { accountManagerId: e.target.value })}
            >
              {amChoices.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
              {/* keep showing a current AM even if they were deactivated */}
              {!amChoices.some((e) => e.id === c.accountManagerId) && (
                <option value={c.accountManagerId}>{employeeName(c.accountManagerId)}</option>
              )}
            </select>
          </label>
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            onClick={() => void setClientActive(c.id, !c.active)}
          >
            {c.active ? "השבתה" : "הפעלה מחדש"}
          </Button>
        </Row>
      ))}
      {accountManagers.length === 0 && (
        <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
          טיפ: מנהל/ת לקוח הוא פשוט עובד/ת שמשויך/ת ללקוח. בחרו מנהל/ת בעת הוספת לקוח.
        </p>
      )}
    </Card>
  );
}

/* ------------------------------------ rtms ----------------------------------- */

function RtmsTab() {
  const { rtms } = useAppData();
  const [filter, setFilter] = useState(defaultRtmFilter);
  const list = useMemo(() => applyRtmFilter(rtms, filter), [rtms, filter]);
  return (
    <div>
      <SectionTitle hint={`${list.length} מתוך ${rtms.length}`}>כל ה‑RTMים</SectionTitle>
      {rtms.length === 0 ? (
        <EmptyState title="עדיין אין RTMים" />
      ) : (
        <>
          <RtmFilterBar value={filter} onChange={setFilter} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <RtmCard
              key={r.id}
              rtm={r}
              editHref={`/edit/${r.id}`}
              onDisqualify={(rtm) => {
                const reason = window.prompt("מה סיבת הפסילה?", rtm.dqReason ?? "");
                if (reason && reason.trim()) {
                  void disqualifyRtm(rtm.id, reason);
                  void createNotification({
                    forUid: rtm.createdByUid,
                    type: "disqualified",
                    text: `ה‑RTM "${rtm.name}" נפסל. סיבה: ${reason.trim()}`,
                    rtmId: rtm.id,
                  });
                }
              }}
              onReinstate={(rtm) => {
                if (confirm(`לבטל את הפסילה של "${rtm.name}"?`)) {
                  void reinstateRtm(rtm.id);
                  void createNotification({
                    forUid: rtm.createdByUid,
                    type: "reinstated",
                    text: `ה‑RTM "${rtm.name}" הוחזר לתחרות.`,
                    rtmId: rtm.id,
                  });
                }
              }}
              onResolveAppeal={(rtm, accept) => {
                const q = accept
                  ? `לקבל את הערעור ולהחזיר את "${rtm.name}" לתחרות?`
                  : `לדחות את הערעור על "${rtm.name}"?`;
                if (confirm(q)) {
                  void resolveAppeal(rtm.id, accept);
                  void createNotification({
                    forUid: rtm.createdByUid,
                    type: accept ? "appeal_accepted" : "appeal_rejected",
                    text: accept
                      ? `הערעור על "${rtm.name}" התקבל — ה‑RTM הוחזר לתחרות.`
                      : `הערעור על "${rtm.name}" נדחה.`,
                    rtmId: rtm.id,
                  });
                }
              }}
              onDelete={(rtm) => {
                if (confirm(`למחוק את "${rtm.name}"? הנקודות שלו יוסרו מהדירוג.`)) {
                  void deleteRtm(rtm.id);
                }
              }}
            />
          ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------------- claims ---------------------------------- */

const CLAIM_LABEL: Record<Claim["category"], string> = {
  not_rtm: "לא RTM אמיתי",
  wrong_credit: "קרדיט לא נכון",
  other: "אחר",
};

function ClaimsTab() {
  const { employeeName } = useAppData();
  const [claims, setClaims] = useState<Claim[]>([]);
  useEffect(() => subscribeClaims(setClaims), []);

  const open = claims.filter((c) => c.status === "open");
  const handled = claims.filter((c) => c.status === "handled");

  const Row = ({ c }: { c: Claim }) => (
    <Card className={cn("space-y-1", c.status === "handled" && "opacity-60")}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-black">{c.rtmName}</span>
        <Badge tone="accent">{CLAIM_LABEL[c.category]}</Badge>
      </div>
      <p className="text-sm text-[var(--color-ink-soft)]">{c.text}</p>
      <p className="text-xs text-[var(--color-ink-soft)]">
        מאת: {c.byEmployeeId ? employeeName(c.byEmployeeId) : "—"}
      </p>
      {c.status === "open" && (
        <div className="pt-1">
          <Button
            variant="outline"
            className="px-3 py-1.5 text-xs"
            onClick={() => void setClaimHandled(c.id)}
          >
            סימון כטופל
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle hint={`${open.length} פתוחות`}>טענות שהוגשו</SectionTitle>
        <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
          טענות שמשתמשים הגישו על RTMים ("יש לי טענה"). לפסילה בפועל — עברו לטאב
          RTMים.
        </p>
        {open.length === 0 ? (
          <EmptyState title="אין טענות פתוחות 🎉" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((c) => (
              <Row key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>

      {handled.length > 0 && (
        <div>
          <SectionTitle hint={`${handled.length}`}>טופלו</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {handled.map((c) => (
              <Row key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- content ---------------------------------- */

function ContentTab() {
  const { settings } = useAppData();
  const [prize, setPrize] = useState(settings.content.monthlyPrize);
  const [announcement, setAnnouncement] = useState(settings.content.announcement);
  const [rules, setRules] = useState(settings.content.rules || DEFAULT_RULES_MD);
  const [saved, setSaved] = useState(false);

  // Sync once settings arrive / change from elsewhere.
  useEffect(() => {
    setPrize(settings.content.monthlyPrize);
    setAnnouncement(settings.content.announcement);
    setRules(settings.content.rules || DEFAULT_RULES_MD);
  }, [settings]);

  const save = async () => {
    await saveSettings({
      ...settings,
      content: { ...settings.content, monthlyPrize: prize, announcement, rules },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-2xl space-y-5">
      <div>
        <SectionTitle>תוכן וטקסטים</SectionTitle>
        <p className="text-sm text-[var(--color-ink-soft)]">
          הכל נשמר ב‑Firestore ומתעדכן מיד לכל המשתמשים.
        </p>
      </div>

      <Field label="🎁 הפרס של החודש" hint="מופיע בראש הדאשבורד ובתקנון.">
        <input
          className={inputClass}
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          placeholder="למשל: ארוחת שף + יום חופש 🍽️"
        />
      </Field>

      <Field
        label="📢 הודעה לדאשבורד"
        hint="באנר בראש הדאשבורד. השאירו ריק כדי להסתיר."
      >
        <input
          className={inputClass}
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="הודעה לצוות…"
        />
      </Field>

      <Field
        label="📜 תקנון"
        hint="תומך בעיצוב פשוט: ‎## כותרת · ‎- נקודת רשימה · ‎**מודגש**."
      >
        <textarea
          className={cn(inputClass, "min-h-80 font-mono text-xs leading-relaxed")}
          dir="rtl"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()}>שמירת תוכן</Button>
        {saved && <span className="text-sm font-bold text-green-600">נשמר ✓</span>}
      </div>
    </Card>
  );
}

/* ---------------------------------- strings ---------------------------------- */

function StringsTab() {
  const { settings } = useAppData();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const o = settings.content.strings ?? {};
    const next: Record<string, string> = {};
    for (const g of STRING_GROUPS) {
      for (const f of g.fields) next[f.key] = o[f.key] ?? DEFAULT_STRINGS[f.key] ?? "";
    }
    setVals(next);
  }, [settings]);

  const set = (k: string, v: string) => setVals((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const overrides: Record<string, string> = {};
    for (const k of Object.keys(vals)) {
      if (vals[k] !== (DEFAULT_STRINGS[k] ?? "")) overrides[k] = vals[k];
    }
    await saveSettings({
      ...settings,
      content: { ...settings.content, strings: overrides },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = async () => {
    if (!confirm("לאפס את כל הטקסטים חזרה לברירת המחדל?")) return;
    await saveSettings({
      ...settings,
      content: { ...settings.content, strings: {} },
    });
  };

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <SectionTitle>טקסטים ומיקרוקופי</SectionTitle>
          <p className="text-sm text-[var(--color-ink-soft)]">
            ערכו כל טקסט בממשק. שדה ריק = ברירת המחדל. אפשר להשתמש ב‑
            <code className="rounded bg-[var(--color-cloud)] px-1">{"{month}"}</code> /{" "}
            <code className="rounded bg-[var(--color-cloud)] px-1">{"{name}"}</code> /{" "}
            <code className="rounded bg-[var(--color-cloud)] px-1">{"{email}"}</code> במקומות הרלוונטיים.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saved && <span className="text-sm font-bold text-green-600">נשמר ✓</span>}
          <Button variant="ghost" onClick={() => void resetAll()}>איפוס הכל</Button>
          <Button onClick={() => void save()}>שמירת טקסטים</Button>
        </div>
      </Card>

      {STRING_GROUPS.map((g) => (
        <Card key={g.title}>
          <SectionTitle>{g.title}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.area ? (
                  <textarea
                    className={cn(inputClass, "min-h-20")}
                    value={vals[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={vals[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()}>שמירת טקסטים</Button>
        {saved && <span className="text-sm font-bold text-green-600">נשמר ✓</span>}
      </div>
    </div>
  );
}

/* ---------------------------------- settings --------------------------------- */

function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [recipientsText, setRecipientsText] = useState("");

  useEffect(
    () =>
      subscribeSettings((s) => {
        setSettings(s);
        setRecipientsText((s.emailDigest.recipients ?? []).join("\n"));
      }),
    [],
  );

  const digest = settings.emailDigest;
  const update = (patch: Partial<AppSettings["emailDigest"]>) =>
    setSettings((s) => ({ ...s, emailDigest: { ...s.emailDigest, ...patch } }));

  const recipients = useMemo(
    () =>
      recipientsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [recipientsText],
  );

  const save = async () => {
    await saveSettings({ ...settings, emailDigest: { ...digest, recipients } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-xl space-y-5">
      <div>
        <SectionTitle>כללי התחרות</SectionTitle>
      </div>
      <Field
        label="מקסימום מציעי רעיון ל‑RTM"
        hint="כמה אנשים אפשר לשייך כבעלי רעיון לאותו פוסט (ברירת מחדל: 2)."
      >
        <input
          type="number"
          min={1}
          max={10}
          className={cn(inputClass, "max-w-[7rem]")}
          value={settings.maxIdeaOwners}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              maxIdeaOwners: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
            }))
          }
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="רוחב קיר התהילה (טורים)" hint="כמה פוסטים לרוחב, במסך רחב.">
          <input
            type="number"
            min={2}
            max={6}
            className={cn(inputClass, "max-w-[7rem]")}
            value={settings.collageCols}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                collageCols: Math.max(2, Math.min(6, Number(e.target.value) || 4)),
              }))
            }
          />
        </Field>
        <Field label="אורך קיר התהילה (שורות)" hint="סה״כ פוסטים = רוחב × אורך.">
          <input
            type="number"
            min={1}
            max={10}
            className={cn(inputClass, "max-w-[7rem]")}
            value={settings.collageRows}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                collageRows: Math.max(1, Math.min(10, Number(e.target.value) || 3)),
              }))
            }
          />
        </Field>
      </div>

      <hr className="border-[var(--color-line)]" />

      <div>
        <SectionTitle>עדכון במייל (בקרוב)</SectionTitle>
        <p className="text-sm text-[var(--color-ink-soft)]">
          הגדרות לשליחת סיכום תקופתי במייל עם מצב התחרות. ההגדרות נשמרות כבר עכשיו;
          השליחה בפועל תופעל בשלב הבא (דורשת הפעלת Cloud Function).
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="size-5"
          checked={digest.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span className="font-bold">להפעיל שליחת סיכום במייל</span>
      </label>

      <Field label="תדירות">
        <select
          className={inputClass}
          value={digest.frequency}
          disabled={!digest.enabled}
          onChange={(e) => update({ frequency: e.target.value as DigestFrequency })}
        >
          <option value="weekly">שבועי</option>
          <option value="biweekly">דו‑שבועי</option>
          <option value="monthly">חודשי</option>
        </select>
      </Field>

      <Field label="נמענים" hint="כתובת מייל בכל שורה (או מופרדות בפסיק).">
        <textarea
          className={cn(inputClass, "min-h-28 font-mono")}
          dir="ltr"
          value={recipientsText}
          disabled={!digest.enabled}
          onChange={(e) => setRecipientsText(e.target.value)}
          placeholder="someone@42creative.co.il"
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()}>שמירת הגדרות</Button>
        {saved && <span className="text-sm font-bold text-green-600">נשמר ✓</span>}
      </div>
    </Card>
  );
}
