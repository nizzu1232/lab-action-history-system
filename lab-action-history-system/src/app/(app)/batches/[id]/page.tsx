"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers, Users, Calendar, CheckCircle } from "lucide-react";

interface BatchDetail {
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

interface BatchStudent {
  id: number;
  studentId: number;
  studentName: string;
  studentUsn: string;
  course: string;
  semester: string;
  status: string;
}

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [batchId, setBatchId] = useState<string>("");
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setBatchId(p.id));
  }, [params]);

  useEffect(() => {
    if (!batchId) return;
    Promise.all([
      fetch(`/api/batches`).then((r) => r.json()),
      fetch(`/api/batch-students?batchId=${batchId}`).then((r) => r.json()),
    ]).then(([batchesData, studentsData]) => {
      const found = batchesData.batches.find((b: any) => b.id === parseInt(batchId));
      setBatch(found);
      setStudents(studentsData.students);
      setLoading(false);
    });
  }, [batchId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!batch) return <div className="text-center p-8">Batch not found</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Batches
      </button>

      <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{batch.batchName}</h1>
            <p className="text-[var(--text-muted)]">
              {batch.course} • {batch.department} • {batch.semester}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="badge badge-success">{batch.status}</span>
              <span className="text-sm text-[var(--text-muted)]">
                Academic Year: {batch.academicYear}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <Users className="w-8 h-8 text-indigo-500 mb-2" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{batch.studentCount}</p>
          <p className="text-xs text-[var(--text-muted)]">Students</p>
        </div>
        <div className="card p-4">
          <Layers className="w-8 h-8 text-cyan-500 mb-2" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{batch.capacity}</p>
          <p className="text-xs text-[var(--text-muted)]">Capacity</p>
        </div>
        <div className="card p-4">
          <Calendar className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{batch.academicYear}</p>
          <p className="text-xs text-[var(--text-muted)]">Year</p>
        </div>
        <div className="card p-4">
          <CheckCircle className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {Math.round((batch.studentCount / batch.capacity) * 100)}%
          </p>
          <p className="text-xs text-[var(--text-muted)]">Filled</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Assigned Students</h2>
          <button className="btn-primary text-sm">Assign Students</button>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-[var(--text-muted)]">No students assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {student.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">{student.studentName}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{student.studentUsn}</p>
                </div>
                <span className={`badge ${student.status === "active" ? "badge-success" : "badge-warning"}`}>
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
