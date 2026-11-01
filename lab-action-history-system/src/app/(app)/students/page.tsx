"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search, Plus, Filter, Download, MoreVertical, X, Users,
  CheckCircle, XCircle, Clock, AlertTriangle, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Upload,
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  usn: string;
  course: string;
  department: string;
  semester: string;
  academicYear: string;
  email: string | null;
  phone: string | null;
  status: string;
  qrId: string;
  avatarColor: string;
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showImport, setShowImport] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (courseFilter) params.set("course", courseFilter);
    params.set("page", page.toString());
    params.set("limit", "12");

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students);
    setTotalPages(data.totalPages);
    setTotal(data.total);
    setLoading(false);
  }, [search, statusFilter, courseFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => loadStudents(), 300);
    return () => clearTimeout(t);
  }, [loadStudents]);

  const statusColors: Record<string, string> = {
    active: "badge-success",
    inactive: "badge-warning",
    graduated: "badge-info",
    suspended: "badge-danger",
  };

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    active: CheckCircle,
    inactive: Clock,
    graduated: CheckCircle,
    suspended: AlertTriangle,
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  async function exportCSV() {
    const res = await fetch(`/api/students?limit=10000`);
    const data = await res.json();
    const csv = [
      "Name,USN,Course,Department,Semester,Academic Year,Email,Phone,Status",
      ...data.students.map((s: Student) =>
        `"${s.name}","${s.usn}","${s.course}","${s.department}","${s.semester}","${s.academicYear}","${s.email || ""}","${s.phone || ""}","${s.status}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Students</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {total} student{total !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link href="/students/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, USN, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input md:w-48"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="input md:w-48"
          >
            <option value="">All Courses</option>
            <option value="BCA">BCA</option>
            <option value="B.Sc CS">B.Sc CS</option>
            <option value="MCA">MCA</option>
          </select>
          {(search || statusFilter || courseFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCourseFilter("");
                setPage(1);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="shimmer h-12 w-12 rounded-full mb-3" />
              <div className="shimmer h-4 w-32 rounded mb-2" />
              <div className="shimmer h-3 w-24 rounded mb-3" />
              <div className="shimmer h-3 w-40 rounded mb-2" />
              <div className="shimmer h-3 w-28 rounded" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No students found
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {search || statusFilter || courseFilter
              ? "Try adjusting your search or filters"
              : "Get started by adding your first student"}
          </p>
          <Link href="/students/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((student, idx) => {
            const StatusIcon = statusIcons[student.status] || CheckCircle;
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="card p-5 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: student.avatarColor }}
                  >
                    {initials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{student.usn}</p>
                  </div>
                  <span className={`badge ${statusColors[student.status]}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {student.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Course</span>
                    <span className="text-[var(--text-primary)] font-medium">{student.course}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Semester</span>
                    <span className="text-[var(--text-primary)]">{student.semester}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Year</span>
                    <span className="text-[var(--text-primary)]">{student.academicYear}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student detail modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl"
                    style={{ backgroundColor: selectedStudent.avatarColor }}
                  >
                    {initials(selectedStudent.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] font-mono">{selectedStudent.usn}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Course</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.course}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Department</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Semester</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.semester}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Academic Year</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.academicYear}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Email</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Phone</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedStudent.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Status</p>
                    <span className={`badge ${statusColors[selectedStudent.status]}`}>{selectedStudent.status}</span>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">QR ID</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] font-mono">{selectedStudent.qrId}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Registered</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {new Date(selectedStudent.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImport(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--card)] rounded-2xl max-w-md w-full shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Import Students from CSV</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                CSV should contain: Name, USN, Course, Department, Semester, Academic Year, Email, Phone
              </p>
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-sm text-[var(--text-primary)] mb-1">Drag & drop CSV or click to browse</p>
                <p className="text-xs text-[var(--text-muted)]">Max 5MB</p>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowImport(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button className="btn-primary flex-1">Upload & Preview</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
