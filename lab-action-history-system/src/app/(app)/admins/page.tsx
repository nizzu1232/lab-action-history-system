"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Plus, Search, X, Loader2, UserCog, KeyRound, Power,
  CheckCircle, AlertTriangle, ShieldCheck, ShieldOff,
} from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarColor: string;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "lab_admin" });
  const [resetPw, setResetPw] = useState("");
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admins");
    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setAdmins(data.admins || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = admins.filter((a) => {
    const s =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const r = !roleFilter || a.role === roleFilter;
    return s && r;
  });

  async function createAdmin() {
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setFormError(data.error || "Failed to create admin");
      return;
    }
    setShowCreate(false);
    setForm({ name: "", email: "", password: "", role: "lab_admin" });
    load();
  }

  async function patchAdmin(id: number, body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/admins", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    setBusy(false);
    if (res.ok) load();
    else {
      const d = await res.json();
      alert(d.error || "Action failed");
    }
  }

  async function doReset() {
    if (!resetTarget || !resetPw) return;
    await patchAdmin(resetTarget.id, { newPassword: resetPw });
    setResetTarget(null);
    setResetPw("");
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  if (forbidden) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <ShieldOff className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-[var(--text-muted)]">
          Admin Management is available only to Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Management</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {admins.length} administrator{admins.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input md:w-48">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="lab_admin">Lab Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((admin, idx) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: admin.avatarColor }}
                >
                  {initials(admin.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">{admin.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${admin.role === "super_admin" ? "badge-info" : "badge-success"}`}>
                  {admin.role === "super_admin" ? (
                    <ShieldCheck className="w-3 h-3 mr-1" />
                  ) : (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {admin.role.replace("_", " ")}
                </span>
                <span className={`badge ${admin.status === "active" ? "badge-success" : "badge-danger"}`}>
                  {admin.status}
                </span>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4">
                Last login: {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    patchAdmin(admin.id, {
                      role: admin.role === "super_admin" ? "lab_admin" : "super_admin",
                    })
                  }
                  disabled={busy}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <UserCog className="w-3 h-3" />
                  {admin.role === "super_admin" ? "Make Lab" : "Make Super"}
                </button>
                <button
                  onClick={() =>
                    patchAdmin(admin.id, {
                      status: admin.status === "active" ? "inactive" : "active",
                    })
                  }
                  disabled={busy}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <Power className="w-3 h-3" />
                  {admin.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setResetTarget(admin)}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Reset
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Administrator</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)]">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Temporary password"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input"
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input"
                >
                  <option value="lab_admin">Lab Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {formError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={createAdmin} disabled={busy} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset password modal */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setResetTarget(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Reset Password</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Set a new password for <b>{resetTarget.name}</b>
              </p>
              <input
                type="text"
                placeholder="New password"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
                className="input"
              />
              <div className="flex gap-2 mt-6">
                <button onClick={() => setResetTarget(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={doReset} disabled={busy || !resetPw} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Reset Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
