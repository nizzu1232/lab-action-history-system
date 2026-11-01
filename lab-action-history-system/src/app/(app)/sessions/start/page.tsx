"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, CheckCircle, AlertCircle, Users, Monitor, Loader2,
  XCircle, Zap, ArrowRight, ArrowLeft, Info,
} from "lucide-react";

interface Batch {
  id: number;
  batchName: string;
  course: string;
  semester: string;
  studentCount: number;
  capacity: number;
  status: string;
}

interface Student {
  id: number;
  studentId: number;
  studentName: string;
  studentUsn: string;
  status: string;
}

function StartSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get("batchId");

  const [step, setStep] = useState(1);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/batches?status=active")
      .then((r) => r.json())
      .then((data) => {
        setBatches(data.batches);
        if (preselectedBatchId) {
          const b = data.batches.find((x: Batch) => x.id === parseInt(preselectedBatchId));
          if (b) {
            setSelectedBatch(b);
            setStep(2);
          }
        }
        setLoading(false);
      });
  }, [preselectedBatchId]);

  useEffect(() => {
    if (selectedBatch) {
      fetch(`/api/batch-students?batchId=${selectedBatch.id}`)
        .then((r) => r.json())
        .then((data) => setStudents(data.students));
    }
  }, [selectedBatch]);

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllActive = () => {
    setSelectedStudents(
      students.filter((s) => s.status === "active").map((s) => s.studentId)
    );
  };

  const deselectAll = () => setSelectedStudents([]);

  async function startSession() {
    if (!selectedBatch || selectedStudents.length === 0) return;
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          studentIds: selectedStudents,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start session");
        setStarting(false);
        return;
      }
      setResult(data);
      setStep(3);
    } catch {
      setError("Network error");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-4" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Start New Lab Session</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Follow the workflow to start a batch-based lab session
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Select Batch" },
          { n: 2, label: "Select Students" },
          { n: 3, label: "Session Started" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s.n
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    : step > s.n
                    ? "bg-green-500 text-white"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                }`}
              >
                {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${
                step >= s.n ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-[var(--border)] mx-3" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Select a Batch
              </h2>
              {batches.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-muted)] mb-4">No active batches found</p>
                  <button onClick={() => router.push("/batches/new")} className="btn-primary">
                    Create Batch
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {batches.map((batch) => (
                    <button
                      key={batch.id}
                      onClick={() => {
                        setSelectedBatch(batch);
                        setStep(2);
                      }}
                      className="text-left p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] hover:border-indigo-500/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--text-primary)] truncate">
                            {batch.batchName}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            {batch.course} • {batch.semester}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {batch.studentCount} students enrolled
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedBatch && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{selectedBatch.batchName}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedBatch.course} • {selectedBatch.semester} • {students.length} students
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Select Students ({selectedStudents.length} selected)
                </h2>
                <div className="flex gap-2">
                  <button onClick={selectAllActive} className="btn-secondary text-sm">
                    Select All Active
                  </button>
                  <button onClick={deselectAll} className="btn-secondary text-sm">
                    Deselect
                  </button>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-muted)]">No students assigned to this batch</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {students.map((student) => {
                    const disabled = student.status !== "active";
                    return (
                      <label
                        key={student.studentId}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          disabled
                            ? "opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]"
                            : selectedStudents.includes(student.studentId)
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-[var(--border)] hover:border-[var(--text-muted)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() => !disabled && toggleStudent(student.studentId)}
                          disabled={disabled}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-[var(--text-primary)]">{student.studentName}</p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">{student.studentUsn}</p>
                        </div>
                        <span className={`badge ${
                          student.status === "active" ? "badge-success" : "badge-warning"
                        }`}>
                          {student.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedStudents([]);
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={startSession}
                  disabled={selectedStudents.length === 0 || starting}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Start {selectedStudents.length} Session{selectedStudents.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Session Started Successfully!
            </h2>
            <p className="text-[var(--text-muted)] mb-6">{result.message}</p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {result.sessions.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Sessions</p>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {result.sessions.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Computers</p>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                <p className="text-2xl font-bold text-[var(--text-primary)]">Active</p>
                <p className="text-xs text-[var(--text-muted)]">Status</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/sessions/live")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                View Live Sessions
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StartSessionPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <StartSessionContent />
    </Suspense>
  );
}
