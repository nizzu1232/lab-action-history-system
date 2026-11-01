"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, CheckCircle, Users, Activity, XCircle, Loader2, PlayCircle } from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

interface BatchStats {
  total: number;
  active: number;
  inactive: number;
  completed: number;
  totalAssigned: number;
  activeSessions: number;
  completedSessions: number;
  perBatch: { id: number; batchName: string; studentCount: number }[];
}

export default function BatchStatsPage() {
  const [stats, setStats] = useState<BatchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats?kind=batch")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
        <p className="text-[var(--text-muted)]">Loading statistics...</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Batches", value: stats.total, icon: Layers, color: "from-indigo-500 to-purple-600" },
    { label: "Active", value: stats.active, icon: CheckCircle, color: "from-green-500 to-emerald-600" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "from-blue-500 to-cyan-600" },
    { label: "Inactive", value: stats.inactive, icon: XCircle, color: "from-yellow-500 to-amber-600" },
    { label: "Assigned Students", value: stats.totalAssigned, icon: Users, color: "from-cyan-500 to-blue-600" },
    { label: "Active Sessions", value: stats.activeSessions, icon: PlayCircle, color: "from-pink-500 to-rose-600" },
    { label: "Completed Sessions", value: stats.completedSessions, icon: Activity, color: "from-violet-500 to-fuchsia-600" },
  ];

  const chartData = stats.perBatch.map((b) => ({
    name: b.batchName.length > 22 ? b.batchName.slice(0, 22) + "…" : b.batchName,
    students: b.studentCount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Batch Statistics</h1>
        <p className="text-sm text-[var(--text-muted)]">Batch performance metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-4"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Students per Batch</h3>
        {chartData.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-8">No batches yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
              <Tooltip />
              <Bar dataKey="students" name="Students" radius={[0, 6, 6, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
