import { NextResponse } from "next/server";
import { getRequests } from "@/lib/requests";

export const dynamic = "force-dynamic";

export async function GET() {
  const requests = await getRequests();
  return NextResponse.json(requests);
}
