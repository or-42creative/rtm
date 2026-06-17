import type { ReactNode } from "react";

import { Card } from "@/components/ui";

/**
 * תקנון התחרות. טקסט עריך — אפשר לשנות חופשי. פרטי הפרסים נקבעים ע״י ההנהלה
 * (placeholder בסעיף "הפרסים").
 */
export function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <div className="animate-fade-up rounded-3xl bg-gradient-to-l from-[var(--c-purple)] via-[var(--c-pink)] to-[var(--c-orange)] p-8 text-white shadow-lg">
        <p className="text-sm font-black text-white/90">תקנון רשמי 📜</p>
        <h1 className="mt-1 text-4xl font-black">תחרות ה‑RTM של ארבעים ושתיים</h1>
        <p className="mt-2 max-w-xl font-medium text-white/90">
          כאן עושים סושיאל — ומי שתופס את הרגע בזמן אמת, מקבל נקודות. זה התקנון
          הקצר והברור של התחרות החודשית.
        </p>
      </div>

      <Rule n="1" title="מה זה RTM ומה המטרה" emoji="⚡">
        RTM (Real‑Time Marketing) הוא תוכן שעולה לסושיאל ומחובר לרגע אקטואלי —
        טרנד, אירוע, חדשה או מם. מטרת התחרות היא לעודד את כולנו לתפוס רגעים, לפרסם
        מהר, ולחגוג את היצירתיות של הצוות.
      </Rule>

      <Rule n="2" title="מי משתתף" emoji="🙌">
        כל עובד/ת של 42 שמחובר/ת לאפליקציה עם חשבון הגוגל של המשרד. בכניסה הראשונה
        בוחרים את השם מתוך רשימת העובדים — כך כל RTM והנקודות משויכים לאדם הנכון.
      </Rule>

      <Rule n="3" title="איך מוסיפים RTM" emoji="📲">
        נכנסים ל“הוספת RTM” וממלאים: שם ה‑RTM, הלקוח, של מי הרעיון (עד 2 אנשים),
        לינק לפוסט בסושיאל, ותאריך (ברירת מחדל — היום). מומלץ לצרף תמונה/וידאו כדי
        שה‑RTM יופיע יפה בקיר שבדאשבורד.
      </Rule>

      <Rule n="4" title="איך נצברות נקודות" emoji="🏅">
        <ul className="list-disc space-y-1.5 ps-5">
          <li>כל בעל/ת רעיון מקבל/ת <b>נקודה אחת</b> על ה‑RTM (אפשר עד 2 בעלי רעיון — כלומר עד 2 נקודות).</li>
          <li>מנהל/ת הלקוח של אותו לקוח מקבל/ת <b>נקודה אחת</b> אוטומטית.</li>
          <li>אם בעל/ת הרעיון הוא/היא גם מנהל/ת הלקוח — <b>נקודה אחת בלבד</b> על אותו RTM (בלי כפילות).</li>
        </ul>
        <div className="mt-3 rounded-xl bg-[var(--color-cloud)] p-3 text-sm">
          <b>דוגמה:</b> RTM ללקוח שמנוהל ע״י דנה, כשהרעיון של יוסי ומיכל →
          יוסי +1, מיכל +1, דנה +1. אם הרעיון היה של דנה עצמה → דנה +1 בלבד.
        </div>
      </Rule>

      <Rule n="5" title="הזוכים החודשיים" emoji="👑">
        בכל חודש מוכתרים <b>שני זוכים</b>:
        <ul className="mt-1.5 list-disc space-y-1.5 ps-5">
          <li><b>מלך/ת הרעיונות</b> — מי שצבר/ה הכי הרבה נקודות רעיון.</li>
          <li><b>מנהל/ת הלקוח של החודש</b> — מי שלקוחותיו/ה צברו הכי הרבה RTMים.</li>
        </ul>
        הספירה מתאפסת בתחילת כל חודש. אפשר לראות את הזוכים של החודש הקודם בדאשבורד.
      </Rule>

      <Rule n="6" title="הוגן ובכיף" emoji="🤝">
        <ul className="list-disc space-y-1.5 ps-5">
          <li>מזינים רק RTMים שבאמת עלו לאוויר, עם לינק אמיתי לפוסט.</li>
          <li>בוחרים את בעלי הרעיון האמיתיים — קרדיט במקום הנכון.</li>
          <li>לייקים ❤️ הם לעידוד וכיף ולא משפיעים על הניקוד.</li>
          <li>מנהל המערכת רשאי להסיר RTM שגוי או כפול.</li>
        </ul>
      </Rule>

      <Rule n="7" title="הפרסים" emoji="🎁">
        הזוכים זוכים בכבוד, בתהילה הנצחית — ובפרס שמתעדכן מעת לעת על ידי ההנהלה.
        (הפרטים המדויקים יוכרזו בערוצי המשרד.)
      </Rule>

      <p className="pb-4 text-center text-xs text-[var(--color-ink-soft)]">
        התקנון עשוי להתעדכן. גרסה ראשונה · תחרות ה‑RTM של ארבעים ושתיים.
      </p>
    </div>
  );
}

function Rule({
  n,
  title,
  emoji,
  children,
}: {
  n: string;
  title: string;
  emoji: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-ink)] text-lg font-black text-white">
        {n}
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-black">
          {emoji} {title}
        </h2>
        <div className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          {children}
        </div>
      </div>
    </Card>
  );
}
