import { NextRequest, NextResponse } from "next/server";
import { addRequest } from "@/lib/requests";

/**
 * API לקבלת אישור תדלוק מ-Auto-Dalkan
 * נקרא כאשר: המתדלק עבר את כל השלבים, הטלפון ליד הרכב, ושניהם ליד תחנת דלק מאותה חברה
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plate, succ } = body;

    // בדיקה שהנתונים נשלחו
    if (!plate || typeof plate !== "string") {
      const err = { error: "missingPlate", message: "חסר מספר רכב" };
      addRequest({ plate: String(plate ?? ""), succ: false, status: "error", errorMessage: err.message });
      return NextResponse.json(err, { status: 400 });
    }

    if (succ === undefined || succ === null) {
      const err = { error: "missingSucc", message: "חסר דגל succ" };
      addRequest({ plate: plate.trim(), succ: false, status: "error", errorMessage: err.message });
      return NextResponse.json(err, { status: 400 });
    }

    // בדיקה ש-succ אכן true (אישור הצלחה)
    if (succ !== true) {
      const err = { error: "notSuccess", message: "התדלוק לא אושר - succ חייב להיות true" };
      addRequest({ plate: plate.trim(), succ: false, status: "error", errorMessage: err.message });
      return NextResponse.json(err, { status: 400 });
    }

    addRequest({ plate: plate.trim(), succ: true, status: "success" });

    // הדפסה לקונסול
    console.log("=== Open-Dalkan: תדלוק אושר ===");
    console.log("מספר רכב:", plate.trim());
    console.log("סטטוס:", "succ=true");
    console.log("זמן:", new Date().toISOString());
    console.log("==============================");

    return NextResponse.json({
      success: true,
      message: "הנתונים התקבלו בהצלחה",
      received: { plate: plate.trim(), succ: true, receivedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Open-Dalkan API error:", error);
    addRequest({ plate: "", succ: false, status: "error", errorMessage: "שגיאת שרת" });
    return NextResponse.json(
      { error: "serverError", message: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
