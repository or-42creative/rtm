import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { linkEmployeeToUser, seedData } from "@/lib/db";
import { Button, Card, FullScreen, Spinner, cn } from "@/components/ui";
import { Logo } from "@/components/Logo";

export function LinkEmployeePage() {
  const { firebaseUser, appUser, signOut } = useAuth();
  const { activeEmployees, loading } = useAppData();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const isAdmin = appUser?.role === "admin";
  const empty = !loading && activeEmployees.length === 0;

  const confirm = async () => {
    if (!selected || !appUser) return;
    setSaving(true);
    try {
      await linkEmployeeToUser(appUser.uid, selected);
      // The user-doc subscription picks up employeeId and routes onward.
    } finally {
      setSaving(false);
    }
  };

  const runSeed = async () => {
    setSeeding(true);
    try {
      await seedData(); // live subscription will fill the list
    } finally {
      setSeeding(false);
    }
  };

  return (
    <FullScreen>
      <Card className="w-full max-w-lg">
        <Logo size={36} />
        <h1 className="mt-5 text-2xl font-black">מי את/ה?</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          חיברת את החשבון {firebaseUser?.email}. בחר/י את השם שלך מהרשימה כדי
          שנדע למי לשייך את ה‑RTMים והנקודות.
        </p>

        {loading ? (
          <div className="grid place-items-center py-10">
            <Spinner />
          </div>
        ) : empty ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-cloud)] p-5 text-center">
            {isAdmin ? (
              <>
                <p className="font-black">רשימת העובדים עדיין ריקה 📋</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-ink-soft)]">
                  כמנהל/ת המערכת, טען/י עכשיו את 24 העובדים ו‑31 הלקוחות מהקבצים.
                  פעולה חד‑פעמית — אחר כך תוכל/י לבחור את עצמך.
                </p>
                <Button className="mt-4" onClick={() => void runSeed()} disabled={seeding}>
                  {seeding ? "טוען…" : "טעינת רשימת העובדים והלקוחות"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-[var(--color-ink-soft)]">
                רשימת העובדים עדיין לא נטענה. בקש/י ממנהל המערכת לטעון אותה, ואז
                רענן/י את הדף.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pe-1">
            {activeEmployees.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e.id)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-start text-sm font-bold transition",
                  selected === e.id
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                {e.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {!empty && !loading && (
            <Button onClick={() => void confirm()} disabled={!selected || saving}>
              {saving ? "שומר…" : "זה אני"}
            </Button>
          )}
          <Button variant="ghost" onClick={() => void signOut()}>
            התחברות עם חשבון אחר
          </Button>
        </div>

        {!empty && (
          <p className="mt-4 text-xs text-[var(--color-ink-soft)]">
            לא מוצא/ת את עצמך? פנה/י למנהל המערכת שיוסיף אותך לרשימת העובדים.
          </p>
        )}
      </Card>
    </FullScreen>
  );
}
