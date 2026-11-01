"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Activity, PlayCircle, StopCircle, Monitor, Clock,
  ChevronLeft, ChevronRight, Loader2, ClipboardList,
} from "lucide-react";

interface ActionRow {
  id: number;
  actionType: string;
  description: string | null;
  timestamp: string;
  sessionId: number | null;
  studentName: string | null;
  studentUsn: string | null;
  computerNumber: string | null;
}

const actionMeta: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  session_started: { icon: PlayCircle, color: "from-green-500 to-emerald-600" },
  session_ended: { icon: StopCircle, color: "from-red-500 to-rose-600" },
  computer_assigned: { icon: Monitor, color: "from-indigo-500 to-purple-600" },
};

export default function ActionHistoryPage() {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (actionType) params.set("actionType", actionType);
    params.set("page", page.toString());
    params.set("limit", "20");
    const res = await fetch(`/api/action-history?${params}`);
    const data = await res.json();
    setRows(data.rows || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, actionType, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Action History</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {total} recorded action{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by student, USN, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </div>
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="input md:w-56"
          >
            <option value="">All Actions</option>
            <option value="session_started">Session Started</option>
            <option value="session_ended">Session Ended</option>
            <option value="computer_assigned">Computer Assigned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
          <p className="text-[var(--text-muted)]">Loading actions...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No actions found</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Try changing your search or filters
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {rows.map((row, idx) => {
              const meta = actionMeta[row.actionType] || {
                icon: Activity,
                color: "from-slate-500 to-slate-600",
              };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-4 hover:bg-[var(--bg-secondary)] transition-colors flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {row.studentName || "Unknown"}{" "}
                          <span className="text-[var(--text-muted)] font-normal">
                            {row.actionType.replace(/_/g, " ")}
                          </span>
                          {row.computerNumber && (
                            <span className="text-[var(--text-muted)] font-normal">
                              {" "}on {row.computerNumber}
                            </span>
                          )}
                        </p>
                        {row.studentUsn && (
                          <p className="text-xs text-[var(--text-muted)] font-mono">{row.studentUsn}</p>
                        )}
                        {row.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1">{row.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(row.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
