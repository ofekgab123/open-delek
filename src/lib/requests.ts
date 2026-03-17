import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export type RequestStatus = "success" | "error";

export type FuelRequest = {
  id: string;
  plate: string;
  succ: boolean;
  status: RequestStatus;
  errorMessage?: string;
  receivedAt: string;
};

const MAX_REQUESTS = 500;

function getFilePath(): string {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return join(dir, "requests.json");
}

function loadRequests(): FuelRequest[] {
  try {
    const data = readFileSync(getFilePath(), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveRequests(requests: FuelRequest[]): void {
  writeFileSync(getFilePath(), JSON.stringify(requests, null, 2), "utf-8");
}

export function addRequest(req: Omit<FuelRequest, "id" | "receivedAt">): FuelRequest {
  const requests = loadRequests();
  const record: FuelRequest = {
    ...req,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  requests.unshift(record);
  if (requests.length > MAX_REQUESTS) {
    requests.pop();
  }
  saveRequests(requests);
  return record;
}

export function getRequests(): FuelRequest[] {
  return loadRequests();
}
