"use client";

import { motion } from "framer-motion";
import { Search, Filter, Activity, User, Layers, Monitor, Shield } from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: number;
  adminId: number | null;
  adminName: string | null;
  action: string;
  description: string | null;
  entityType: string | null;
  entityId: number | null;
  timestamp: Date;
  ipAddress: string | null;
}

const entityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  student: User,
  batch: Layers,
  session: Monitor,
  system: Activity,
};

export default function AuditLogsClient({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const filtered = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName?.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = !entityFilter || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Logs</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track all administrative activities and changes
        </p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="">All Types</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="batch">Batch</option>
            <option value="session">Session</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No audit logs
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Activities will appear here as administrators use the system
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((log, idx) => {
              const Icon = entityIcons[log.entityType || "system"] || Activity;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className="p-4 hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {log.description || log.action}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {log.adminName || "System"} • {log.action}
                          </p>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {log.entityType && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge badge-info">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              ID: {log.entityId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
