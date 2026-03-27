import { createHash, randomBytes } from "node:crypto";

const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS).toISOString();

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isPasswordResetExpired(expiresAt: string | undefined) {
  if (!expiresAt) {
    return true;
  }

  const expiresTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresTime)) {
    return true;
  }

  return Date.now() > expiresTime;
}
