"use client";

import { useEffect, useState, useCallback } from "react";

type FuelRequest = {
  id: string;
  plate: string;
  succ: boolean;
  status: "success" | "error";
  errorMessage?: string;
  receivedAt: string;
};

export default function Home() {
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Open-Dalkan</h1>
        <p className="text-slate-600 text-sm mb-6">
          מסך בקשות תדלוק – מתעדכן אוטומטית כל 3 שניות
        </p>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-right py-3 px-4 font-medium text-slate-600">זמן</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">מספר רכב</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">succ</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">סטטוס</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">פרטים</th>
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    טוען...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    אין בקשות עדיין
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs" dir="ltr">
                      {formatTime(r.receivedAt)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {r.plate || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          r.succ
                            ? "text-green-600 font-medium"
                            : "text-slate-500"
                        }
                      >
                        {r.succ ? "true" : "false"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status === "success" ? "הצלחה" : "שגיאה"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs max-w-[200px]">
                      {r.errorMessage || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
