/**
 * Every user-facing string in the app, with a default value. Admins can
 * override any of these from the admin "טקסטים" tab (stored in
 * settings.content.strings); the app reads them via `t(key)` with these as
 * the fallback. A few support tokens: {month}, {name}, {email}.
 */
export const DEFAULT_STRINGS: Record<string, string> = {
  // ניווט
  "nav.dashboard": "דאשבורד",
  "nav.submit": "הוספת RTM",
  "nav.myRtms": "ה‑RTMים שלי",
  "nav.rules": "תקנון",
  "nav.admin": "ניהול",
  "nav.signOut": "יציאה",
  "nav.adminBadge": "אדמין",
  "nav.footer": "תחרות ה‑RTM של 42 · נבנה באהבה לסושיאל",

  // דאשבורד
  "dash.kicker": "דאשבורד · תחרות ה‑RTM",
  "dash.prizeLabel": "הפרס של החודש",
  "dash.prizeEmpty": "ייקבע בקרוב ✨",
  "dash.topClient": "הלקוח המוביל",
  "dash.ideaBoard": "💡 מביאי הרעיונות",
  "dash.amBoard": "🎯 מנהלי לקוח מובילים",
  "dash.boardEmpty": "אין עדיין נתונים לחודש הזה.",
  "dash.collage": "🎬 הקיר של ה‑RTMים",
  "dash.collageEmptyTitle": "הקיר עוד ריק 🎨",
  "dash.collageEmptyHint":
    "ברגע שיעלו RTMים החודש הם יופיעו כאן בקולאז׳ צבעוני. רוצים להיות הראשונים?",
  "dash.collageCta": "להעלות RTM",
  "dash.pace": "📈 קצב החודש",
  "dash.loved": "❤️ הכי אהובים החודש",
  "dash.lovedEmpty": "עדיין אין לייקים החודש. תהיו הראשונים לפרגן!",
  "dash.prevMonths": "📅 חודשים קודמים",
  "dash.winnersTitle": "🏆 הזוכים של {month}",
  "dash.winnerIdea": "מלך/ת הרעיונות 👑",
  "dash.winnerIdeaSub": "הכי הרבה נקודות רעיון",
  "dash.winnerAm": "מנהל/ת הלקוח של החודש ⭐",
  "dash.winnerAmSub": "הכי הרבה RTM ללקוחות",
  "dash.winnersEmpty": "אין עדיין זוכים לחודש הקודם",

  // הוספת RTM
  "submit.heading": "הוספת RTM",
  "submit.intro": "כל RTM מזכה את בעלי הרעיון ואת מנהל/ת הלקוח בנקודה. מלאו את הפרטים 👇",
  "submit.name": "שם ה‑RTM",
  "submit.namePh": "במה מדובר?",
  "submit.client": "לקוח",
  "submit.clientPh": "בחרו לקוח…",
  "submit.date": "תאריך",
  "submit.dateHint": "ברירת המחדל היא היום — אפשר לשנות.",
  "submit.amNote": "מנהל/ת הלקוח: {name} — יקבל/תקבל נקודה אוטומטית על ה‑RTM הזה.",
  "submit.idea": "של מי הרעיון?",
  "submit.ideaHint": "אפשר לבחור עד 2 אנשים. כל אחד מהם מקבל נקודה.",
  "submit.ideaPh": "בחרו בעל/ת רעיון…",
  "submit.ideaPhMore": "להוסיף עוד אחד…",
  "submit.link": "לינק ל‑RTM בסושיאל",
  "submit.linkHint": "אינסטגרם / טיקטוק / פייסבוק / יוטיוב / X — נציג תצוגה מקדימה אוטומטית.",
  "submit.media": "תמונה (אופציונלי)",
  "submit.mediaHintEmbed": "זוהתה תצוגה מהלינק. אפשר גם להעלות תמונה שתבלוט בקולאז׳.",
  "submit.mediaHintNone":
    "מומלץ להעלות תמונה שתופיע יפה בקולאז׳. וידאו מוצג אוטומטית מהלינק לסושיאל.",
  "submit.preview": "תצוגה מקדימה",
  "submit.button": "פרסום ה‑RTM",
  "submit.error": "שמירת ה‑RTM נכשלה. בדקו את החיבור ונסו שוב.",

  // ה‑RTMים שלי
  "my.title": "ה‑RTMים שלי",
  "my.statMonth": "רעיונות החודש",
  "my.statTotal": "סה״כ רעיונות",
  "my.statAm": "RTM ללקוחות שלי החודש",
  "my.emptyTitle": "עוד לא העלית RTM 😴",
  "my.emptyHint":
    "ברגע שתעלה/י RTM ותסמן/י שהרעיון שלך — הוא יופיע כאן ותתחיל/י לצבור נקודות.",
  "my.emptyCta": "להעלות RTM ראשון",

  // מסך "לא ברשימה" (כשהמייל לא שויך לעובד)
  "link.resolving": "מזהים אותך…",
  "link.notFoundTitle": "עוד לא ברשימה 👋",
  "link.notFoundBody":
    "המייל {email} עדיין לא משויך לאף עובד. פנה/י לאור כדי שיוסיף אותך לרשימת העובדים, ואז התחבר/י שוב.",
  "link.other": "התחברות עם חשבון אחר",

  // תקנון
  "rules.kicker": "תקנון רשמי 📜",
  "rules.title": "תחרות ה‑RTM של 42",
  "rules.tagline": "כאן עושים סושיאל — ומי שתופס את הרגע בזמן אמת, מקבל נקודות.",
};

export interface StringField {
  key: string;
  label: string;
  area?: boolean;
}
export interface StringGroup {
  title: string;
  fields: StringField[];
}

/** Grouping + human labels for the admin editor. */
export const STRING_GROUPS: StringGroup[] = [
  {
    title: "ניווט וכותרת תחתונה",
    fields: [
      { key: "nav.dashboard", label: "דאשבורד" },
      { key: "nav.submit", label: "הוספת RTM" },
      { key: "nav.myRtms", label: "ה‑RTMים שלי" },
      { key: "nav.rules", label: "תקנון" },
      { key: "nav.admin", label: "ניהול" },
      { key: "nav.signOut", label: "יציאה" },
      { key: "nav.adminBadge", label: "תגית אדמין" },
      { key: "nav.footer", label: "כותרת תחתונה", area: true },
    ],
  },
  {
    title: "דאשבורד",
    fields: [
      { key: "dash.kicker", label: "כותרת על" },
      { key: "dash.winnersTitle", label: "כותרת הזוכים ({month})" },
      { key: "dash.winnerIdea", label: "זוכה — רעיונות" },
      { key: "dash.winnerIdeaSub", label: "זוכה — רעיונות (משנה)" },
      { key: "dash.winnerAm", label: "זוכה — מנהל/ת לקוח" },
      { key: "dash.winnerAmSub", label: "זוכה — מנהל/ת לקוח (משנה)" },
      { key: "dash.winnersEmpty", label: "אין זוכים" },
      { key: "dash.prizeLabel", label: "תווית הפרס" },
      { key: "dash.prizeEmpty", label: "פרס — ברירת מחדל" },
      { key: "dash.topClient", label: "תווית לקוח מוביל" },
      { key: "dash.ideaBoard", label: "טבלת רעיונות" },
      { key: "dash.amBoard", label: "טבלת מנהלי לקוח" },
      { key: "dash.boardEmpty", label: "טבלה ריקה" },
      { key: "dash.collage", label: "כותרת הקיר" },
      { key: "dash.collageEmptyTitle", label: "קיר ריק — כותרת" },
      { key: "dash.collageEmptyHint", label: "קיר ריק — טקסט", area: true },
      { key: "dash.collageCta", label: "קיר ריק — כפתור" },
      { key: "dash.pace", label: "כותרת הקצב" },
      { key: "dash.loved", label: "כותרת הכי אהובים" },
      { key: "dash.lovedEmpty", label: "אין לייקים" },
      { key: "dash.prevMonths", label: "כותרת חודשים קודמים" },
    ],
  },
  {
    title: "הוספת RTM",
    fields: [
      { key: "submit.heading", label: "כותרת" },
      { key: "submit.intro", label: "טקסט פתיח", area: true },
      { key: "submit.name", label: "שם — תווית" },
      { key: "submit.namePh", label: "שם — רמז" },
      { key: "submit.client", label: "לקוח — תווית" },
      { key: "submit.clientPh", label: "לקוח — רמז" },
      { key: "submit.date", label: "תאריך — תווית" },
      { key: "submit.dateHint", label: "תאריך — רמז" },
      { key: "submit.amNote", label: "הערת מנהל/ת לקוח ({name})", area: true },
      { key: "submit.idea", label: "רעיון — תווית" },
      { key: "submit.ideaHint", label: "רעיון — רמז" },
      { key: "submit.ideaPh", label: "רעיון — רמז ראשון" },
      { key: "submit.ideaPhMore", label: "רעיון — רמז נוסף" },
      { key: "submit.link", label: "לינק — תווית" },
      { key: "submit.linkHint", label: "לינק — רמז", area: true },
      { key: "submit.media", label: "מדיה — תווית" },
      { key: "submit.mediaHintEmbed", label: "מדיה — רמז (יש הטמעה)", area: true },
      { key: "submit.mediaHintNone", label: "מדיה — רמז (אין הטמעה)", area: true },
      { key: "submit.preview", label: "תצוגה מקדימה" },
      { key: "submit.button", label: "כפתור פרסום" },
      { key: "submit.error", label: "הודעת שגיאה", area: true },
    ],
  },
  {
    title: "ה‑RTMים שלי",
    fields: [
      { key: "my.title", label: "כותרת" },
      { key: "my.statMonth", label: "סטט — רעיונות החודש" },
      { key: "my.statTotal", label: "סטט — סה״כ" },
      { key: "my.statAm", label: "סטט — מנהל/ת לקוח" },
      { key: "my.emptyTitle", label: "ריק — כותרת" },
      { key: "my.emptyHint", label: "ריק — טקסט", area: true },
      { key: "my.emptyCta", label: "ריק — כפתור" },
    ],
  },
  {
    title: "מסך 'לא ברשימה'",
    fields: [
      { key: "link.notFoundTitle", label: "כותרת" },
      { key: "link.notFoundBody", label: "טקסט ({email})", area: true },
      { key: "link.other", label: "כפתור חשבון אחר" },
      { key: "link.resolving", label: "טקסט זיהוי" },
    ],
  },
  {
    title: "עמוד תקנון",
    fields: [
      { key: "rules.kicker", label: "כותרת על" },
      { key: "rules.title", label: "כותרת" },
      { key: "rules.tagline", label: "תת‑כותרת", area: true },
    ],
  },
];
