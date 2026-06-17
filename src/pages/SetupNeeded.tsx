import { FullScreen, Card } from "@/components/ui";
import { Logo } from "@/components/Logo";

const VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export function SetupNeeded() {
  return (
    <FullScreen>
      <Card className="max-w-lg">
        <Logo size={40} />
        <h1 className="mt-5 text-2xl font-black">כמעט שם 👋</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          האפליקציה עדיין לא מחוברת ל‑Firebase. צרו פרויקט ב‑Firebase, העתיקו את
          קובץ <code className="rounded bg-[var(--color-cloud)] px-1">.env.example</code> ל‑
          <code className="rounded bg-[var(--color-cloud)] px-1">.env</code> ומלאו את הערכים:
        </p>
        <ul className="mt-4 space-y-1 rounded-xl bg-[var(--color-cloud)] p-4 font-mono text-xs">
          {VARS.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          ההוראות המלאות נמצאות בקובץ <code className="rounded bg-[var(--color-cloud)] px-1">README.md</code>.
          אחרי שמילאתם — הריצו מחדש <code className="rounded bg-[var(--color-cloud)] px-1">npm run dev</code>.
        </p>
      </Card>
    </FullScreen>
  );
}
