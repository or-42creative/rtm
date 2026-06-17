/**
 * Initial data for 42's RTM app, taken from the files the office provided:
 *   - רשימת עובדים.txt        → 24 employees
 *   - לקוחות ומנהלות לקוח.xlsx → 31 clients mapped to their account manager
 *
 * IDs are stable ("e1".."e24", "c1"..) so re-running the seed is idempotent
 * (it overwrites the same docs rather than creating duplicates). After seeding,
 * everything is editable from the admin panel.
 */

export interface SeedEmployee {
  id: string;
  name: string;
}

export interface SeedClient {
  id: string;
  name: string;
  accountManagerId: string;
}

export const SEED_EMPLOYEES: SeedEmployee[] = [
  { id: "e1", name: "אור אסולין" },
  { id: "e2", name: "יהונתן טוכפלד" },
  { id: "e3", name: "יראת טוכפלד" },
  { id: "e4", name: "רננה זומר" },
  { id: "e5", name: "אורי סמואל" },
  { id: "e6", name: "אליה קוגן" },
  { id: "e7", name: "רויה אבידר" },
  { id: "e8", name: "בר אליה ורולקר" },
  { id: "e9", name: "דביר לויטס" },
  { id: "e10", name: "הילה לוי ארזי" },
  { id: "e11", name: "יערה אלק" },
  { id: "e12", name: "ליאור דורון ג'ורג'י" },
  { id: "e13", name: "ליאת ריבינסקי" },
  { id: "e14", name: "מוריה שמש" },
  { id: "e15", name: "מיטל הילמה פלדמן" },
  { id: "e16", name: "מיכל אברהם" },
  { id: "e17", name: "משה כהן" },
  { id: "e18", name: "נטע רונן" },
  { id: "e19", name: "עדי אפשטיין" },
  { id: "e20", name: "רחלי אופיר" },
  { id: "e21", name: "עומר עסיס" },
  { id: "e22", name: "רנן פאר-בריקמן" },
  { id: "e23", name: "רעות היזמי" },
  { id: "e24", name: "שירי הינדי" },
];

// Account managers (subset of the employees above):
//   e6  אליה קוגן | e7 רויה אבידר | e18 נטע רונן | e21 עומר עסיס | e22 רנן פאר-בריקמן
export const SEED_CLIENTS: SeedClient[] = [
  { id: "c1", name: "ICA - המרכז הישראלי להתמכרויות", accountManagerId: "e21" },
  { id: "c2", name: "אינוויזקוק", accountManagerId: "e21" },
  { id: "c3", name: "בתי אמנה", accountManagerId: "e6" },
  { id: "c4", name: "אקדימה", accountManagerId: "e18" },
  { id: "c5", name: "דה פארק דיזיין", accountManagerId: "e21" },
  { id: "c6", name: "דיזנגוף סנטר", accountManagerId: "e22" },
  { id: "c7", name: 'חל"פ בנימין', accountManagerId: "e6" },
  { id: "c8", name: "עיריית הרצליה", accountManagerId: "e18" },
  { id: "c9", name: "חסלט", accountManagerId: "e6" },
  { id: "c10", name: "ישראכרט", accountManagerId: "e22" },
  { id: "c11", name: "מגדל", accountManagerId: "e7" },
  { id: "c12", name: "מוזיאון המדע", accountManagerId: "e21" },
  { id: "c13", name: "מכללת אחוה", accountManagerId: "e18" },
  { id: "c14", name: "מלונות אסטרל", accountManagerId: "e6" },
  { id: "c15", name: "נירלט", accountManagerId: "e6" },
  { id: "c16", name: "סוזוקי", accountManagerId: "e18" },
  { id: "c17", name: "עוגן", accountManagerId: "e6" },
  { id: "c18", name: "עוף טוב", accountManagerId: "e21" },
  { id: "c19", name: "עזר מציון", accountManagerId: "e22" },
  { id: "c20", name: "עיריית ירושלים", accountManagerId: "e18" },
  { id: "c21", name: "עמותת אותי", accountManagerId: "e7" },
  { id: "c22", name: "עמותת אחי", accountManagerId: "e6" },
  { id: "c23", name: "עמותת שלומית", accountManagerId: "e7" },
  { id: "c24", name: "לוד LOV", accountManagerId: "e6" },
  { id: "c25", name: "קבוצת ריאליטי", accountManagerId: "e6" },
  { id: "c26", name: "קונסומרז", accountManagerId: "e7" },
  { id: "c27", name: "קפה גן סיפור", accountManagerId: "e22" },
  { id: "c28", name: "שגרירים בלב", accountManagerId: "e7" },
  { id: "c29", name: "שומרי הדרך", accountManagerId: "e18" },
  { id: "c30", name: "שיכון ובינוי", accountManagerId: "e21" },
  { id: "c31", name: "תוכנית עמית", accountManagerId: "e21" },
];
