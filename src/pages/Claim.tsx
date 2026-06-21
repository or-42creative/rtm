import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { createClaim, notifyAdmins } from "@/lib/db";
import type { ClaimCategory } from "@/types";
import { Button, Card, Field, cn, inputClass } from "@/components/ui";

const CATS: { id: ClaimCategory; label: string }[] = [
  { id: "not_rtm", label: "זה לא RTM אמיתי" },
  { id: "wrong_credit", label: "הקרדיט לא נכון" },
  { id: "other", label: "משהו אחר" },
];

export function ClaimPage() {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const { rtms } = useAppData();
  const [rtmId, setRtmId] = useState("");
  const [category, setCategory] = useState<ClaimCategory>("not_rtm");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const activeRtms = rtms.filter((r) => r.status !== "disqualified");
  const canSubmit = rtmId && text.trim();

  const submit = async () => {
    const rtm = rtms.find((r) => r.id === rtmId);
    if (!canSubmit || !appUser || !rtm) return;
    setSaving(true);
    try {
      await createClaim({
        rtmId: rtm.id,
        rtmName: rtm.name,
        byUid: appUser.uid,
        byEmployeeId: appUser.employeeId ?? null,
        category,
        text: text.trim(),
      });
      await notifyAdmins("claim", `טענה חדשה על "${rtm.name}".`, rtm.id);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="text-center">
          <p className="text-3xl">📨</p>
          <p className="mt-2 text-lg font-black">הטענה נשלחה</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            מנהל המערכת יקבל התראה ויבדוק את הטענה.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
            חזרה לדאשבורד
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-black">יש לי טענה 🙋</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        משהו ב‑RTM לא נראה לך תקין? ספר/י לנו ומנהל המערכת יבדוק.
      </p>

      <Card className="mt-5 space-y-5">
        <Field label="על איזה RTM?" required>
          <select className={inputClass} value={rtmId} onChange={(e) => setRtmId(e.target.value)}>
            <option value="">בחרו RTM…</option>
            {activeRtms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.clientName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="מה הטענה?" required>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-bold transition",
                  category === c.id
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="פירוט" required hint="ספר/י בחופשיות מה הבעיה.">
          <textarea
            className={cn(inputClass, "min-h-28")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="לדוגמה: זה לא באמת RTM כי…"
          />
        </Field>

        <Button onClick={() => void submit()} disabled={!canSubmit || saving}>
          {saving ? "שולח…" : "שליחה לאדמין"}
        </Button>
      </Card>
    </div>
  );
}
