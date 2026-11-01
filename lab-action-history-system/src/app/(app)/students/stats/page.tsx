"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserCheck, UserX, GraduationCap, AlertTriangle, Monitor, Activity, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from "recharts";

interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  suspended: number;
  inLab: number;
  totalSessions: number;
  byCourse: { course: string; c: number }[];
  bySemester: { semester: string; c: number }[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function StudentStatsPage() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats?kind=student")
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
    { label: "Total Students", value: stats.total, icon: Users, color: "from-indigo-500 to-purple-600" },
    { label: "Active", value: stats.active, icon: UserCheck, color: "from-green-500 to-emerald-600" },
    { label: "Inactive", value: stats.inactive, icon: UserX, color: "from-yellow-500 to-amber-600" },
    { label: "Graduated", value: stats.graduated, icon: GraduationCap, color: "from-blue-500 to-cyan-600" },
    { label: "Suspended", value: stats.suspended, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
    { label: "Currently in Lab", value: stats.inLab, icon: Monitor, color: "from-cyan-500 to-blue-600" },
    { label: "Total Sessions", value: stats.totalSessions, icon: Activity, color: "from-pink-500 to-rose-600" },
  ];

  const statusData = [
    { name: "Active", value: stats.active },
    { name: "Inactive", value: stats.inactive },
    { name: "Graduated", value: stats.graduated },
    { name: "Suspended", value: stats.suspended },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Student Statistics</h1>
        <p className="text-sm text-[var(--text-muted)]">Enrollment and activity analytics</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(e) => `${e.name}: ${e.value}`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Students by Course</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.byCourse}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="c" name="Students" radius={[6, 6, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Students by Semester</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.bySemester}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
              <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="c" name="Students" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
