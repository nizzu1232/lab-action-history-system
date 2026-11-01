"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, CheckCircle, Clock, Wrench, WifiOff, ChevronDown, Loader2, AlertTriangle } from "lucide-react";

interface Computer {
  id: number;
  computerNumber: string;
  status: string;
  location: string;
}

export default function ComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const loadComputers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/computers");
      const data = await res.json();
      setComputers(data.computers);
    } catch (err) {
      setError("Failed to load computers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComputers();
  }, []);

  const updateStatus = async (computerId: number, newStatus: string) => {
    if (!["available", "maintenance", "offline", "occupied"].includes(newStatus)) return;

    setUpdating(computerId);
    setError("");
    try {
      const res = await fetch("/api/computers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: computerId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update status");
      } else {
        setComputers((prev) =>
          prev.map((c) => (c.id === computerId ? { ...c, status: newStatus } : c))
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setUpdating(null);
    }
  };

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    available: CheckCircle,
    occupied: Clock,
    maintenance: Wrench,
    offline: WifiOff,
  };

  const statusColors: Record<string, string> = {
    available: "from-green-500 to-emerald-600",
    occupied: "from-orange-500 to-red-600",
    maintenance: "from-yellow-500 to-amber-600",
    offline: "from-gray-500 to-slate-600",
  };

  const statusBadgeColors: Record<string, string> = {
    available: "badge-success",
    occupied: "badge-warning",
    maintenance: "badge-info",
    offline: "badge-danger",
  };

  const statusLabels: Record<string, string> = {
    available: "Available",
    occupied: "Occupied",
    maintenance: "Maintenance",
    offline: "Offline",
  };

  const counts = {
    available: computers.filter((c) => c.status === "available").length,
    occupied: computers.filter((c) => c.status === "occupied").length,
    maintenance: computers.filter((c) => c.status === "maintenance").length,
    offline: computers.filter((c) => c.status === "offline").length,
  };

  const filtered = filter ? computers.filter((c) => c.status === filter) : computers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Computers</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Monitor and manage lab workstations - change status with dropdown menus
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-xs font-bold">DISMISS</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([status, count]) => {
          const Icon = statusIcons[status];
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? "" : status)}
              className={`card p-4 transition-all ${filter === status ? "ring-2 ring-indigo-500" : ""}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${statusColors[status]} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{count}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{status}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((computer, idx) => {
          const Icon = statusIcons[computer.status];
          const isUpdating = updating === computer.id;

          return (
            <motion.div
              key={computer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="card p-4 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusColors[computer.status]} flex items-center justify-center mb-3 mx-auto`}>
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] text-center mb-2">
                {computer.computerNumber}
              </h3>

              <div className="relative">
                <select
                  value={computer.status}
                  onChange={(e) => updateStatus(computer.id, e.target.value)}
                  disabled={isUpdating}
                  className={`w-full py-1.5 px-2 rounded-lg border bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-medium appearance-none pr-6 ${
                    isUpdating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[var(--card)] text-[var(--text-primary)]">
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              </div>

              {isUpdating && (
                <div className="mt-2 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                </div>
              )}

              <p className="text-xs text-[var(--text-muted)] text-center mt-2">{computer.location}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Status Guide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-[var(--text-muted)]">Available - Ready for new sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-[var(--text-muted)]">Occupied - Currently in use</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-[var(--text-muted)]">Maintenance - Temporarily unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span className="text-xs text-[var(--text-muted)]">Offline - Not responding / powered off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
