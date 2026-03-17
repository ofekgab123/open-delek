import { createDecipheriv, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(token: string): Buffer {
  return createHash("sha256").update(token).digest();
}

export function decryptPayload(encryptedBase64: string, token: string): { plate: string; succ: boolean; ts: number } | null {
  try {
    const key = getKey(token);
    const buf = Buffer.from(encryptedBase64, "base64");
    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(buf.length - AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH, buf.length - AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(
      "aes-256-gcm" as const,
      key,
      iv,
      { authTagLength: AUTH_TAG_LENGTH }
    );
    decipher.setAuthTag(authTag);
    const decrypted = decipher.update(ciphertext) + decipher.final("utf8");
    const parsed = JSON.parse(decrypted) as { plate?: string; succ?: boolean; ts?: number };
    if (typeof parsed.plate !== "string" || parsed.succ !== true || typeof parsed.ts !== "number") {
      return null;
    }
    return { plate: parsed.plate, succ: parsed.succ, ts: parsed.ts };
  } catch {
    return null;
  }
}
