"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Monitor, PlayCircle, StopCircle, RefreshCw } from "lucide-react";

interface LiveSession {
  id: number;
  studentId: number;
  computerId: number;
  batchId: number;
  startTime: string;
  status: string;
  studentName: string;
  studentUsn: string;
  computerNumber: string;
}

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const res = await fetch("/api/sessions?status=active");
    const data = await res.json();
    setSessions(data.sessions);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  async function endSession(sessionId: number) {
    if (!confirm("End this session?")) return;
    await fetch("/api/sessions/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    loadSessions();
  }

  const formatDuration = (startTime: string) => {
    const diff = Math.floor((currentTime.getTime() - new Date(startTime).getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Live Sessions</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={loadSessions} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="shimmer h-12 w-12 rounded-xl mb-4" />
              <div className="shimmer h-5 w-32 rounded mb-2" />
              <div className="shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No active sessions
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Start a new lab session to see live activity
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <span className="badge badge-success flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">{session.studentName}</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono mb-4">{session.studentUsn}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Computer</span>
                  <span className="font-medium text-[var(--text-primary)]">{session.computerNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Duration</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {formatDuration(session.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Started</span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(session.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => endSession(session.id)}
                className="w-full btn-danger flex items-center justify-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                End Session
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
