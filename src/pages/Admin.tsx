import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import {
  addClient,
  addEmployee,
  deleteRtm,
  deleteUser,
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
import type { AppSettings, AppUser, DigestFrequency } from "@/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  SectionTitle,
  cn,
  inputClass,
} from "@/components/ui";
import { RtmCard } from "@/components/RtmCard";

type Tab = "users" | "employees" | "clients" | "rtms" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "users", label: "משתמשים" },
  { id: "employees", label: "עובדים" },
  { id: "clients", label: "לקוחות" },
  { id: "rtms", label: "RTMים" },
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
        <span className="font-bold">{value}</span>
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
                <div className="me-auto min-w-0">
                  <div className="font-bold">
                    {u.employeeId ? employeeName(u.employeeId) : u.displayName}
                    {u.role === "admin" && <Badge tone="accent">אדמין</Badge>}
                    {isSelf && <span className="ms-1 text-xs text-[var(--color-ink-soft)]">(את/ה)</span>}
                  </div>
                  <div className="text-xs text-[var(--color-ink-soft)]" dir="ltr">
                    {u.email}
                  </div>
                </div>

                <select
                  className={cn(inputClass, "h-9 w-40 py-1")}
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

  return (
    <div className="space-y-4">
      <SeedCard />
      <Card>
        <SectionTitle hint={`${employees.filter((e) => e.active).length} פעילים`}>עובדים</SectionTitle>
        <div className="mb-4 flex gap-2">
          <input
            className={inputClass}
            placeholder="שם עובד/ת חדש/ה"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                void addEmployee(name);
                setName("");
              }
            }}
          />
          <Button
            onClick={() => {
              if (name.trim()) {
                void addEmployee(name);
                setName("");
              }
            }}
          >
            הוספה
          </Button>
        </div>
        {employees.map((e) => (
          <Row key={e.id}>
            <span className="me-auto">
              <InlineEdit value={e.name} onSave={(v) => void updateEmployee(e.id, { name: v })} />
              {!e.active && <Badge tone="neutral">לא פעיל</Badge>}
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
  const seeded = employees.length > 0 || clients.length > 0;
  return (
    <Card className="bg-[var(--color-cloud)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black">אתחול נתונים</p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            טעינת רשימת העובדים והלקוחות מהקבצים שסופקו. אפשר להריץ שוב — זה לא
            יוצר כפילויות ולא מוחק שיוכים קיימים.
          </p>
        </div>
        <Button
          variant={seeded ? "outline" : "primary"}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await seedData();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "טוען…" : seeded ? "רענון מהקבצים" : "טעינת נתונים"}
        </Button>
      </div>
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
              className={cn(inputClass, "h-9 w-40 py-1")}
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
  return (
    <div>
      <SectionTitle hint={`${rtms.length} סה״כ`}>כל ה‑RTMים</SectionTitle>
      {rtms.length === 0 ? (
        <EmptyState title="עדיין אין RTMים" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rtms.map((r) => (
            <RtmCard
              key={r.id}
              rtm={r}
              onDelete={(rtm) => {
                if (confirm(`למחוק את "${rtm.name}"? הנקודות שלו יוסרו מהדירוג.`)) {
                  void deleteRtm(rtm.id);
                }
              }}
            />
          ))}
        </div>
      )}
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
