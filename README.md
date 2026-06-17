# RTM · 42 🏆

אפליקציית ווב לתחרות ה‑RTM החודשית של משרד הפרסום **42**. עובדים מתחברים עם
Google, מעלים RTMים, וצוברים נקודות. לכולם יש דאשבורד משותף, ולמנהל יש מסך ניהול.

נבנה עם **React + TypeScript + Vite + Tailwind**, על גבי **Firebase**
(Authentication · Firestore · Storage).

---

## מה יש באפליקציה

- **התחברות Google** מוגבלת לדומיין המייל של המשרד.
- **הוספת RTM**: עד 2 בעלי רעיון, לקוח (מהרשימה), שם, לינק לסושיאל, תאריך
  (ברירת מחדל = היום), ותמונה/וידאו — עם **הטמעה אוטומטית** של הפוסט מאינסטגרם /
  טיקטוק / יוטיוב / פייסבוק / X, או העלאה ידנית.
- **דאשבורד משותף**: כמה RTMים החודש, הלקוח המוביל, טבלאות מובילים (מביאי רעיונות
  ומנהלי לקוח), והזוכים של החודש הקודם. אפשר לדפדף בין חודשים.
- **ה‑RTMים שלי**: פילוח אישי לפי חודשים.
- **מסך ניהול** (אדמין): ניהול משתמשים, עובדים, לקוחות ומנהלי לקוח, מחיקת RTMים,
  אתחול נתונים, והגדרת עדכון מייל עתידי.

### לוגיקת הנקודות
כל RTM נותן נקודה לכל בעל/ת רעיון (עד 2) **וגם** למנהל/ת הלקוח של אותו לקוח.
אם בעל/ת הרעיון הוא/היא גם מנהל/ת הלקוח — מקבל/ת נקודה אחת בלבד על אותו RTM.
בכל חודש יש שני זוכים: **מביא/ת הרעיונות** המוביל/ה, ו**מנהל/ת הלקוח** עם הכי הרבה RTMים.

---

## הקמה (פעם אחת)

### 1. פרויקט Firebase
1. היכנסו ל‑[Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. **Build → Authentication → Get started → Sign‑in method → Google → Enable.**
   ב‑*Authorized domains* הוסיפו את הדומיין שאליו תפרסו (וגם `localhost` לפיתוח).
3. **Build → Firestore Database → Create database** (Production mode).
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** — צרו אפליקציית
   ווב והעתיקו את אובייקט ה‑`firebaseConfig`.

> אין צורך ב‑Storage! תמונות שמעלים נדחסות בדפדפן ונשמרות ישירות ב‑Firestore,
> כך שהכל נשאר בשלב החינמי (Spark) בלי כרטיס אשראי. וידאו מוצג מהלינק לסושיאל.

### 2. משתני סביבה
העתיקו את `.env.example` ל‑`.env` ומלאו מתוך ה‑config:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# רק חשבונות בדומיין הזה יוכלו להיכנס
VITE_ALLOWED_EMAIL_DOMAINS=42creative.co.il

# המייל של המנהל/ת הראשון/ה — יקבל אוטומטית הרשאות אדמין
VITE_BOOTSTRAP_ADMIN_EMAILS=you@42creative.co.il
```

### 3. כללי האבטחה
בקובץ [`firestore.rules`](firestore.rules) ערכו שני דברים:
- `isOffice()` — שנו את הדומיין אם הוא אינו `42creative.co.il`.
- `bootstrapAdmins()` — שימו שם את **אותו** מייל אדמין שב‑`VITE_BOOTSTRAP_ADMIN_EMAILS`.

### 4. התקנה והרצה מקומית
```bash
npm install
npm run dev
```
פותח את האפליקציה ב‑`http://localhost:5173`.

### 5. כניסה ראשונה ואתחול נתונים
1. התחברו עם חשבון האדמין שהגדרתם → אתם נכנסים כאדמין.
2. בחרו את השם שלכם מרשימת העובדים (קישור חשבון לעובד).
3. עברו ל‑**ניהול → עובדים → "טעינת נתונים"** כדי לטעון את 24 העובדים ו‑31
   הלקוחות מהקבצים שסופקו. (אפשר להריץ שוב בכל עת — לא נוצרות כפילויות.)
4. מכאן כל עובד מתחבר עם Google, בוחר את שמו פעם אחת, ומתחיל להעלות RTMים.

---

## פריסה לאוויר (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # בחרו את הפרויקט; יעדכן את .firebaserc
npm run build
firebase deploy               # פורס hosting + firestore.rules
```

> כדי לפרוס רק חלק: `firebase deploy --only hosting` /
> `--only firestore:rules`.

---

## נתוני המקור
רשימות העובדים והלקוחות נלקחו מהקבצים שהושמו בתיקייה
(`רשימת עובדים.txt`, `לקוחות ומנהלות לקוח.xlsx`) ומקודדות ב‑
[`src/data/seed.ts`](src/data/seed.ts). אחרי האתחול הכל נערך ממסך הניהול, כך
שהקבצים המקוריים אינם נחוצים לאפליקציה עצמה.

---

## מבנה הפרויקט
```
src/
  lib/        firebase, auth, נתונים חיים (appData), גישת Firestore (db),
              לוגיקת ניקוד (scores), זיהוי סושיאל (social)
  components/ UI בסיסי, Layout, לוגו, כרטיס RTM, תצוגת מדיה
  pages/      Login · LinkEmployee · Dashboard · SubmitRtm · MyRtms · Admin
  data/       seed.ts — עובדים + לקוחות התחלתיים
```

---

## בהמשך: עדכון תקופתי במייל
מסך הניהול כבר שומר את הגדרות הדייג'סט (הפעלה/תדירות/נמענים). השליחה בפועל תתווסף
כ‑Cloud Function מתוזמן (Scheduled Function) שירוץ לפי התדירות, יחשב את מצב
התחרות וישלח מייל (למשל דרך SendGrid / Resend). הערה: Cloud Functions דורש את
תוכנית **Blaze** של Firebase (חינמי בפועל לנפחים קטנים).
