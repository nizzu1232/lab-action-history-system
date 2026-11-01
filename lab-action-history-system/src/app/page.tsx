"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Mail, Eye, EyeOff, Shield, Loader2, AlertCircle,
  Keyboard, Sun, Moon, Monitor, Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { saveAuthToken, authFetch } from "@/lib/client-auth";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) window.location.href = "/dashboard";
      })
      .catch(() => {});
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      saveAuthToken(data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/50 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Lab Action History</h1>
          <p className="text-slate-400 text-sm">Management System • College Computer Laboratory</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-strong rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Sign In</h2>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "light" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-label="Light theme"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "dark" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-label="Dark theme"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "system" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-label="System theme"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="admin@college.edu"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                />
                Remember me
              </label>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Keyboard className="w-3 h-3" /> Ctrl+Enter
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <p className="text-xs text-slate-400 text-center">Demo accounts — click to fill</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@college.edu");
                  setPassword("admin123");
                  setError("");
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
              >
                <p className="text-[11px] text-indigo-300 font-medium">Super Admin</p>
                <p className="text-[11px] text-slate-300 truncate">admin@college.edu</p>
                <p className="text-[11px] text-slate-400">admin123</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("lab@college.edu");
                  setPassword("lab123");
                  setError("");
                }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-colors"
              >
                <p className="text-[11px] text-pink-300 font-medium">Lab Admin</p>
                <p className="text-[11px] text-slate-300 truncate">lab@college.edu</p>
                <p className="text-[11px] text-slate-400">lab123</p>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Passwords are hashed with bcrypt. Sessions use secure cookies + JWT.</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-slate-500 text-sm">
            © 2026 BCA Final Year Project • Lab Action History Management System
          </p>
        </motion.div>
      </div>
    </div>
  );
}
