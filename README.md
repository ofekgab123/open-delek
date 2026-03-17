# Open-Dalkan

שירות לקבלת אישור תדלוק מ-Auto-Dalkan ופתיחת הדלק (אוטומציה בהמשך).

משתמש **באותו מסד נתונים** כמו Auto-Dalkan – טבלת `open_delek` שומרת את כל הבקשות.

## הגדרה

הוסף `DATABASE_URL` (אותו ערך כמו ב-Auto-Dalkan):
- **מקומי:** קובץ `.env`
- **Vercel:** Environment Variables בפרויקט

## API

### POST /api/fuel

מקבל בקשה מ-Auto-Dalkan כאשר התדלוק אושר (הטלפון ליד הרכב, שניהם ליד תחנת דלק).

**Body (JSON):**
```json
{
  "plate": "1234567",
  "succ": true
}
```

**תגובה בהצלחה (200):**
```json
{
  "success": true,
  "message": "הנתונים התקבלו בהצלחה",
  "received": {
    "plate": "1234567",
    "succ": true,
    "receivedAt": "2024-..."
  }
}
```

## הרצה

```bash
npm run dev
```

ברירת מחדל: http://localhost:3002 (פורט 3002 כדי לא להתנגש עם Auto-Dalkan)

## חיבור ל-Auto-Dalkan

ב-Auto-Dalkan הוסף ל-.env:
```
OPEN_DALKAN_URL=http://localhost:3002
```

הרץ את שני הפרויקטים – Auto-Dalkan על 3000, Open-Dalkan על 3002.
# open-delek
# open-delek
