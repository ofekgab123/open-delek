import { prisma } from "./db";

export type RequestStatus = "success" | "error";

export type FuelRequest = {
  id: string;
  plate: string;
  succ: boolean;
  status: RequestStatus;
  errorMessage?: string;
  receivedAt: string;
};

export async function addRequest(
  req: Omit<FuelRequest, "id" | "receivedAt">
): Promise<FuelRequest> {
  const record = await prisma.openDelekRequest.create({
    data: {
      plate: req.plate,
      succ: req.succ,
      status: req.status,
      errorMessage: req.errorMessage ?? null,
    },
  });
  return {
    id: record.id,
    plate: record.plate,
    succ: record.succ,
    status: record.status as RequestStatus,
    errorMessage: record.errorMessage ?? undefined,
    receivedAt: record.createdAt.toISOString(),
  };
}

export async function getRequests(): Promise<FuelRequest[]> {
  const records = await prisma.openDelekRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return records.map((r) => ({
    id: r.id,
    plate: r.plate,
    succ: r.succ,
    status: r.status as RequestStatus,
    errorMessage: r.errorMessage ?? undefined,
    receivedAt: r.createdAt.toISOString(),
  }));
}
