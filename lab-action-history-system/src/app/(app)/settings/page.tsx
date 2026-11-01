"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Customize your application preferences</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
            <p className="text-sm text-[var(--text-muted)]">Customize the look and feel</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as "light" | "dark" | "system")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === opt.value
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    theme === opt.value ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-muted)]"
                  }`} />
                  <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
            <p className="text-sm text-[var(--text-muted)]">Manage notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Email notifications", desc: "Receive email alerts for important events" },
            { label: "Browser notifications", desc: "Get desktop notifications for live updates" },
            { label: "Session alerts", desc: "Alert when sessions start or end" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
              <div>
                <p className="font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Security</h2>
            <p className="text-sm text-[var(--text-muted)]">Security and privacy settings</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Session Timeout</p>
              <p className="text-sm text-[var(--text-muted)]">Auto-logout after 30 minutes of inactivity</p>
            </div>
            <span className="badge badge-success">Enabled</span>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Two-Factor Authentication</p>
              <p className="text-sm text-[var(--text-muted)]">Additional security layer</p>
            </div>
            <button className="btn-secondary text-sm">Configure</button>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">About</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Lab Action History Management System v1.0.0
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          © 2026 BCA Final Year Project • Built with Next.js, Drizzle ORM, and Tailwind CSS
        </p>
      </div>
    </div>
  );
}
