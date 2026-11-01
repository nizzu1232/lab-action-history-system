"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, Plus, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface Batch {
  id: number;
  batchName: string;
  course: string;
  department: string;
  semester: string;
  academicYear: string;
  capacity: number;
  status: string;
  studentCount: number;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/batches")
      .then((res) => res.json())
      .then((data) => {
        setBatches(data.batches);
        setLoading(false);
      });
  }, []);

  const statusColors: Record<string, string> = {
    active: "badge-success",
    inactive: "badge-warning",
    completed: "badge-info",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Batches</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {batches.length} batch{batches.length !== 1 ? "es" : ""} created
          </p>
        </div>
        <Link href="/batches/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Batch
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="shimmer h-12 w-12 rounded-xl mb-4" />
              <div className="shimmer h-5 w-40 rounded mb-2" />
              <div className="shimmer h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="card p-12 text-center">
          <Layers className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No batches yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Create your first batch to start organizing students
          </p>
          <Link href="/batches/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Batch
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <span className={`badge ${statusColors[batch.status]}`}>{batch.status}</span>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-2">
                {batch.batchName}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {batch.course} • {batch.semester}
              </p>
              <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Students</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {batch.studentCount} / {batch.capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                    style={{ width: `${(batch.studentCount / batch.capacity) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Year</span>
                  <span className="font-medium text-[var(--text-primary)]">{batch.academicYear}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/batches/${batch.id}`}
                  className="btn-secondary flex-1 text-center text-sm"
                >
                  View Details
                </Link>
                {batch.status === "active" && (
                  <Link
                    href={`/sessions/start?batchId=${batch.id}`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Start Session
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
