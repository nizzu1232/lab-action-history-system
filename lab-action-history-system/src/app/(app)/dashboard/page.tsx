"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Monitor, Activity, Layers, UserCheck, Computer, Calendar,
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Zap,
} from "lucide-react";

interface DashboardStats {
  students: { total: number; active: number; inactive: number; graduated: number; suspended: number };
  batches: { total: number; active: number };
  computers: { total: number; available: number; occupied: number; maintenance: number; offline: number };
  sessions: { active: number; total: number; today: number };
  activeBatchesWithStudents: Array<{
    id: number;
    batchName: string;
    course: string;
    semester: string;
    studentCount: number;
  }>;
}

interface StatCard {
  title: string;
  value: number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards: StatCard[] = stats
    ? [
        {
          title: "Total Students",
          value: stats.students.total,
          change: "+12%",
          changeType: "up",
          icon: Users,
          color: "text-indigo-600 dark:text-indigo-400",
          gradient: "from-indigo-500 to-purple-600",
        },
        {
          title: "Active Students",
          value: stats.students.active,
          change: `${Math.round((stats.students.active / stats.students.total) * 100)}%`,
          changeType: "neutral",
          icon: UserCheck,
          color: "text-green-600 dark:text-green-400",
          gradient: "from-green-500 to-emerald-600",
        },
        {
          title: "Active Sessions",
          value: stats.sessions.active,
          change: "Live",
          changeType: "up",
          icon: Activity,
          color: "text-cyan-600 dark:text-cyan-400",
          gradient: "from-cyan-500 to-blue-600",
        },
        {
          title: "Available PCs",
          value: stats.computers.available,
          change: `of ${stats.computers.total}`,
          changeType: "neutral",
          icon: Computer,
          color: "text-purple-600 dark:text-purple-400",
          gradient: "from-purple-500 to-pink-600",
        },
        {
          title: "Active Batches",
          value: stats.batches.active,
          change: `${stats.batches.total} total`,
          changeType: "neutral",
          icon: Layers,
          color: "text-orange-600 dark:text-orange-400",
          gradient: "from-orange-500 to-red-600",
        },
        {
          title: "Today's Sessions",
          value: stats.sessions.today,
          change: "Today",
          changeType: "up",
          icon: Calendar,
          color: "text-pink-600 dark:text-pink-400",
          gradient: "from-pink-500 to-rose-600",
        },
      ]
    : [];

  const computerUtilization = stats
    ? Math.round((stats.computers.occupied / stats.computers.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="shimmer h-4 w-24 rounded mb-4" />
              <div className="shimmer h-8 w-16 rounded mb-2" />
              <div className="shimmer h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 lg:p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-indigo-500/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Welcome to Lab Action History
            </h2>
            <p className="text-[var(--text-secondary)]">
              Monitor and manage your college computer laboratory in real-time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                System Online
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                  {card.changeType === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                  {card.changeType === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                  <span>{card.change}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Computer utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 lg:col-span-1"
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Computer Utilization
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-[var(--bg-tertiary)]"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${computerUtilization * 5.03} 503`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  {computerUtilization}%
                </span>
                <span className="text-sm text-[var(--text-muted)]">Utilized</span>
              </div>
            </div>
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Available</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {stats?.computers.available}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Occupied</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {stats?.computers.occupied}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Maintenance</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {stats?.computers.maintenance}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Offline</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {stats?.computers.offline}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active batches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Active Batches</h3>
            <span className="badge badge-info">
              {stats?.activeBatchesWithStudents.length} Active
            </span>
          </div>
          <div className="space-y-3">
            {stats?.activeBatchesWithStudents.map((batch, idx) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--text-primary)] truncate">
                    {batch.batchName}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)]">
                    {batch.course} • {batch.semester}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {batch.studentCount}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Students</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/sessions/start"
            className="flex flex-col items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:shadow-md hover:border-indigo-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">
              Start Session
            </span>
          </a>
          <a
            href="/students/new"
            className="flex flex-col items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:shadow-md hover:border-green-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">
              Add Student
            </span>
          </a>
          <a
            href="/batches/new"
            className="flex flex-col items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:shadow-md hover:border-cyan-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">
              Create Batch
            </span>
          </a>
          <a
            href="/reports"
            className="flex flex-col items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:shadow-md hover:border-pink-500/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">
              View Reports
            </span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
