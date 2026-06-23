const UNLOCK_PREFIX = "flip-board-unlock:";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSharePassword(password: string): Promise<string> {
  const normalized = password.trim();
  if (!normalized) return "";

  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function verifySharePassword(
  password: string,
  lockHash: string,
): Promise<boolean> {
  if (!lockHash) return true;
  const hash = await hashSharePassword(password);
  return hash === lockHash;
}

export function getUnlockStorageKey(lockHash: string): string {
  return `${UNLOCK_PREFIX}${lockHash}`;
}

export function readStoredUnlock(lockHash: string): boolean {
  if (typeof window === "undefined" || !lockHash) return false;
  try {
    return sessionStorage.getItem(getUnlockStorageKey(lockHash)) === "1";
  } catch {
    return false;
  }
}

export function storeUnlock(lockHash: string): void {
  if (typeof window === "undefined" || !lockHash) return;
  try {
    sessionStorage.setItem(getUnlockStorageKey(lockHash), "1");
  } catch {
    // ignore quota / private mode
  }
}
