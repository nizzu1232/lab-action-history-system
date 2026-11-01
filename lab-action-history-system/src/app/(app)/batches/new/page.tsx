"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check } from "lucide-react";

export default function CreateBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    batchName: "",
    course: "BCA",
    department: "Computer Applications",
    semester: "6th Semester",
    academicYear: "2026-2027",
    capacity: 45,
  });

  const update = (field: string, value: string | number) =>
    setData((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Failed to create batch");
      setLoading(false);
      return;
    }
    router.push("/batches");
  }

  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div className="card p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create New Batch</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Define a new batch to organize student lab sessions</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Batch Name</label>
            <input
              type="text"
              value={data.batchName}
              onChange={(e) => update("batchName", e.target.value)}
              className="input"
              placeholder="BCA 6th Semester Morning Batch"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Course</label>
              <select
                value={data.course}
                onChange={(e) => update("course", e.target.value)}
                className="input"
              >
                <option value="BCA">BCA</option>
                <option value="B.Sc CS">B.Sc CS</option>
                <option value="MCA">MCA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Department</label>
              <input
                type="text"
                value={data.department}
                onChange={(e) => update("department", e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Semester</label>
              <select
                value={data.semester}
                onChange={(e) => update("semester", e.target.value)}
                className="input"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Academic Year</label>
              <input
                type="text"
                value={data.academicYear}
                onChange={(e) => update("academicYear", e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Capacity</label>
            <input
              type="number"
              value={data.capacity}
              onChange={(e) => update("capacity", parseInt(e.target.value) || 0)}
              className="input"
              min={1}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Batch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
