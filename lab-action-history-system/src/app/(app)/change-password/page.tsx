"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock, Eye, EyeOff, Check, X, Loader2, ArrowLeft, ShieldCheck, CheckCircle,
} from "lucide-react";
import { authFetch } from "@/lib/client-auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const checks = [
    { label: "At least 8 characters", ok: next.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(next) },
    { label: "One lowercase letter", ok: /[a-z]/.test(next) },
    { label: "One number", ok: /[0-9]/.test(next) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(next) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-yellow-500", "bg-green-500", "bg-green-500"][strength];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) {
      setError("New passwords do not match");
      return;
    }
    if (strength < 5) {
      setError("Password does not meet all requirements");
      return;
    }
    setLoading(true);
    const res = await authFetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next, confirmPassword: confirm }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to change password");
      return;
    }
    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <div className="card p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Change Password</h1>
            <p className="text-sm text-[var(--text-muted)]">Keep your account secure</p>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Password Changed!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Your password has been updated successfully.
            </p>
            <button onClick={() => router.push("/profile")} className="btn-primary">
              Back to Profile
            </button>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={show ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="input pl-10 pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={show ? "text" : "password"}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {next && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{strengthLabel}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-2 text-xs">
                        {c.ok ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        )}
                        <span className={c.ok ? "text-green-600 dark:text-green-400" : "text-[var(--text-muted)]"}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
              {confirm && next !== confirm && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Change Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
