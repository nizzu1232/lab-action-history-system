"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Clock, Calendar, Users, ChevronRight } from "lucide-react";

interface SessionHistory {
  id: number;
  studentName: string;
  studentUsn: string;
  computerNumber: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  status: string;
}

export default function SessionHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions?status=completed")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions);
        setLoading(false);
      });
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Session History</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {sessions.length} completed session{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="shimmer h-4 w-32 rounded mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No session history
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Completed sessions will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                    USN
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                    Computer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                    Duration
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sessions.map((session, idx) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => router.push(`/sessions/${session.id}`)}
                    className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {session.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {session.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)] font-mono">
                      {session.studentUsn}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {session.computerNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                        {formatDuration(session.durationSeconds)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                      {new Date(session.startTime).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
