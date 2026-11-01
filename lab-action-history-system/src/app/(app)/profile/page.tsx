"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Clock, Calendar, Activity, Edit, Lock } from "lucide-react";
import { authFetch } from "@/lib/client-auth";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  lastLogin: string | null;
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setAdmin(data.admin);
        setLoading(false);
      });
  }, []);

  if (loading || !admin) return <div className="text-center p-8">Loading...</div>;

  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your account settings</p>
      </div>

      <div className="card p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl"
            style={{ backgroundColor: admin.avatarColor }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{admin.name}</h2>
            <p className="text-[var(--text-muted)] mb-2">{admin.email}</p>
            <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium capitalize">
              {admin.role.replace("_", " ")}
            </span>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Email Address</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Role</p>
                <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                  {admin.role.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Last Login</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Status</p>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[var(--border)]">
          <a href="/change-password" className="btn-secondary inline-flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </a>
        </div>
      </div>
    </div>
  );
}
