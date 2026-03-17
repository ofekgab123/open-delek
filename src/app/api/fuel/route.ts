import { NextRequest, NextResponse } from "next/server";
import { addRequest } from "@/lib/requests";
import { decryptPayload } from "@/lib/open-delek-crypto";

/**
 * API לקבלת אישור תדלוק מ-Auto-Dalkan
 * הנתונים מגיעים מוצפנים (AES-256-GCM). דורש Authorization: Bearer <token>
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const expectedToken = process.env.OPEN_DALKAN_TOKEN;

    if (!expectedToken || !token || token !== expectedToken) {
      return NextResponse.json(
        { error: "unauthorized", message: "חסר או שגוי token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { payload: encrypted } = body;

    if (!encrypted || typeof encrypted !== "string") {
      await addRequest({ plate: "", succ: false, status: "error", errorMessage: "חסר payload מוצפן" });
      return NextResponse.json(
        { error: "invalidPayload", message: "חסר payload מוצפן" },
        { status: 400 }
      );
    }

    const decrypted = decryptPayload(encrypted, expectedToken);
    if (!decrypted) {
      await addRequest({ plate: "", succ: false, status: "error", errorMessage: "פענוח נכשל" });
      return NextResponse.json(
        { error: "decryptFailed", message: "לא ניתן לפענח את הנתונים" },
        { status: 400 }
      );
    }

    const { plate, succ } = decrypted;

    if (!plate || typeof plate !== "string") {
      const err = { error: "missingPlate", message: "חסר מספר רכב" };
      await addRequest({ plate: String(plate ?? ""), succ: false, status: "error", errorMessage: err.message });
      return NextResponse.json(err, { status: 400 });
    }

    if (succ !== true) {
      const err = { error: "notSuccess", message: "התדלוק לא אושר - succ חייב להיות true" };
      await addRequest({ plate: plate.trim(), succ: false, status: "error", errorMessage: err.message });
      return NextResponse.json(err, { status: 400 });
    }

    await addRequest({ plate: plate.trim(), succ: true, status: "success" });

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
    try {
      await addRequest({ plate: "", succ: false, status: "error", errorMessage: "שגיאת שרת" });
    } catch {}
    return NextResponse.json(
      { error: "serverError", message: "שגיאה בשרת" },
      { status: 500 }
    );
  }
}
