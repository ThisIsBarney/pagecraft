import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string, salt?: string) {
  const resolvedSalt = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, resolvedSalt, SCRYPT_KEYLEN).toString("hex");
  return {
    salt: resolvedSalt,
    hash,
  };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const computed = scryptSync(password, salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hash, "hex");

  if (computed.byteLength !== stored.byteLength) {
    return false;
  }

  return timingSafeEqual(computed, stored);
}
