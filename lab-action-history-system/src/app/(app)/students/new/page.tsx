"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, User, GraduationCap, Sparkles,
  Loader2, AlertCircle,
} from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    name: "",
    usn: "",
    email: "",
    phone: "",
    course: "",
    department: "",
    semester: "",
    academicYear: "2026-2027",
  });

  const update = (field: string, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const step1Valid = data.name && data.usn && data.email;
  const step2Valid = data.course && data.department && data.semester;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to create student");
        setLoading(false);
        return;
      }
      router.push("/students");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester"];
  const courses = [
    { value: "BCA", dept: "Computer Applications" },
    { value: "B.Sc CS", dept: "Computer Science" },
    { value: "MCA", dept: "Computer Applications (PG)" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      <div className="card p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Register New Student
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Complete the registration in 3 simple steps
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Basic Info", icon: User },
            { n: 2, label: "Academic Info", icon: GraduationCap },
            { n: 3, label: "Confirmation", icon: Sparkles },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.n;
            const isComplete = step > s.n;
            return (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                    }`}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isActive || isComplete
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-0.5 mx-2 mt-[-20px]">
                    <div
                      className={`h-full transition-all ${
                        step > s.n
                          ? "bg-green-500"
                          : "bg-[var(--border)]"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                  placeholder="e.g., Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  USN (University Seat Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.usn}
                  onChange={(e) => update("usn", e.target.value.toUpperCase())}
                  className="input font-mono"
                  placeholder="e.g., 1RV21CA001"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="input"
                    placeholder="student@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="input"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.course}
                  onChange={(e) => {
                    const c = courses.find((x) => x.value === e.target.value);
                    update("course", e.target.value);
                    if (c) update("department", c.dept);
                  }}
                  className="input"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.department}
                  onChange={(e) => update("department", e.target.value)}
                  className="input"
                  placeholder="Computer Applications"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.semester}
                    onChange={(e) => update("semester", e.target.value)}
                    className="input"
                  >
                    <option value="">Select semester</option>
                    {semesters.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.academicYear}
                    onChange={(e) => update("academicYear", e.target.value)}
                    className="input"
                    placeholder="2026-2027"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  Review Student Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Name</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.name}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">USN</p>
                    <p className="font-medium text-[var(--text-primary)] font-mono">{data.usn}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Email</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.email}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Phone</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Course</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.course}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Department</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.department}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Semester</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.semester}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] mb-1">Academic Year</p>
                    <p className="font-medium text-[var(--text-primary)]">{data.academicYear}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
