"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Monitor, Clock, User, Layers, PlayCircle, StopCircle,
  Activity, Loader2, Calendar,
} from "lucide-react";

interface SessionDetail {
  id: number;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  status: string;
  studentName: string;
  studentUsn: string;
  computerNumber: string;
  batchName: string | null;
}

interface TimelineItem {
  id: number;
  actionType: string;
  description: string | null;
  timestamp: string;
}

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session);
        setTimeline(d.timeline || []);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
      </div>
    );
  }
  if (!session) {
    return <div className="card p-12 text-center text-[var(--text-muted)]">Session not found</div>;
  }

  const iconFor = (t: string) =>
    t === "session_started" ? PlayCircle : t === "session_ended" ? StopCircle : Activity;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Session #{session.id}</h1>
              <p className="text-[var(--text-muted)]">{session.studentName} • {session.studentUsn}</p>
            </div>
          </div>
          <span className={`badge ${session.status === "active" ? "badge-success" : "badge-info"}`}>
            {session.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <User className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Student</p>
          <p className="font-medium text-[var(--text-primary)] text-sm">{session.studentName}</p>
        </div>
        <div className="card p-4">
          <Monitor className="w-6 h-6 text-cyan-500 mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Computer</p>
          <p className="font-medium text-[var(--text-primary)] text-sm">{session.computerNumber}</p>
        </div>
        <div className="card p-4">
          <Layers className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Batch</p>
          <p className="font-medium text-[var(--text-primary)] text-sm">{session.batchName || "—"}</p>
        </div>
        <div className="card p-4">
          <Clock className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-xs text-[var(--text-muted)]">Duration</p>
          <p className="font-medium text-[var(--text-primary)] text-sm">
            {fmtDuration(session.durationSeconds || 0)}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Session Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--text-muted)] mb-1">Started</p>
            <p className="font-medium text-[var(--text-primary)]">
              {new Date(session.startTime).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] mb-1">Ended</p>
            <p className="font-medium text-[var(--text-primary)]">
              {session.endTime ? new Date(session.endTime).toLocaleString() : "Still active"}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Activity Timeline
        </h3>
        {timeline.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-4">No activity recorded</p>
        ) : (
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[var(--border)]" />
            {timeline.map((item, idx) => {
              const Icon = iconFor(item.actionType);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative mb-6 last:mb-0"
                >
                  <div className="absolute -left-8 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-[var(--card)]">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="font-medium text-[var(--text-primary)] capitalize">
                      {item.actionType.replace(/_/g, " ")}
                    </p>
                    {item.description && (
                      <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
                    )}
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
