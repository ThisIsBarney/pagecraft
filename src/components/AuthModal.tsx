"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

interface AuthSuccessResponse {
  user: AuthUser;
}

interface AuthVerificationResponse {
  success: boolean;
  requiresVerification?: boolean;
  message?: string;
  devVerificationUrl?: string;
}

interface AuthErrorResponse {
  error?: string;
  errorCode?: string;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string"
  );
}

function isAuthSuccessResponse(value: unknown): value is AuthSuccessResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const response = value as Record<string, unknown>;
  return isAuthUser(response.user);
}

function isVerificationResponse(value: unknown): value is AuthVerificationResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const response = value as Record<string, unknown>;
  return response.requiresVerification === true;
}

function getError(value: unknown, fallback: string) {
  if (!value || typeof value !== "object") {
    return { message: fallback, errorCode: "" };
  }
  const response = value as AuthErrorResponse;
  return {
    message: typeof response.error === "string" ? response.error : fallback,
    errorCode: typeof response.errorCode === "string" ? response.errorCode : "",
  };
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [devVerificationUrl, setDevVerificationUrl] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const resetAuthNotice = () => {
    setPendingVerification(false);
    setVerificationMessage("");
    setDevVerificationUrl("");
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "resend_verification",
          email,
        }),
      });

      const data: unknown = await response.json();
      if (!response.ok) {
        const parsed = getError(data, "Unable to resend verification email.");
        throw new Error(parsed.message);
      }

      if (isVerificationResponse(data)) {
        setPendingVerification(true);
        setVerificationMessage(
          data.message || "Verification email sent. Please check your inbox."
        );
        setDevVerificationUrl(data.devVerificationUrl || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    resetAuthNotice();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          email,
          password,
          name: mode === "register" ? name : undefined,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const parsed = getError(data, "Authentication failed");
        if (parsed.errorCode === "email_not_verified") {
          setPendingVerification(true);
          setVerificationMessage(parsed.message);
          return;
        }
        throw new Error(parsed.message);
      }

      if (isVerificationResponse(data)) {
        setPendingVerification(true);
        setVerificationMessage(
          data.message || "Registration successful. Please verify your email."
        );
        setDevVerificationUrl(data.devVerificationUrl || "");
        return;
      }

      if (!isAuthSuccessResponse(data)) {
        throw new Error("Authentication response was invalid");
      }

      onSuccess(data.user);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] border border-black/10 bg-white p-7 shadow-[0_30px_90px_rgba(24,21,18,0.16)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {mode === "login"
                ? "Use your email and password to continue."
                : "Create an account and verify your email."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-3 py-1 text-sm text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {pendingVerification && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <p>{verificationMessage || "Please verify your email."}</p>
            {devVerificationUrl && (
              <a
                href={devVerificationUrl}
                className="mt-2 block break-all text-xs text-emerald-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dev verification link
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                minLength={8}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>

          {pendingVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full rounded-full border border-black/12 bg-white py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resend verification email
            </button>
          )}
        </form>

        <div className="mt-5 border-t border-black/8 pt-5 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              resetAuthNotice();
            }}
            className="font-medium text-stone-700 underline-offset-4 hover:text-stone-950 hover:underline"
          >
            {mode === "login" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
