"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle, Loader2,
  ArrowLeft, Download, Copy,
} from "lucide-react";

interface PreviewRow {
  row: number;
  name: string;
  usn: string;
  course: string;
  department: string;
  semester: string;
  academicYear: string;
  email: string;
  phone: string;
  errors: string[];
  duplicate: boolean;
}

const SAMPLE = `Name,USN,Course,Department,Semester,Academic Year,Email,Phone
John Doe,1RV26CA100,BCA,Computer Applications,6th Semester,2026-2027,john@student.edu,+91 9876543210
Jane Smith,1RV26CA101,BCA,Computer Applications,6th Semester,2026-2027,jane@student.edu,+91 9876543211`;

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = cells[idx] || ""));
    rows.push(obj);
  }
  return rows;
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) {
      setError("CSV appears empty or has no data rows");
      return;
    }
    setRawRows(rows);
    await runPreview(rows);
  }

  async function runPreview(rows: Record<string, string>[]) {
    setLoading(true);
    const res = await fetch("/api/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, commit: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Preview failed");
      setLoading(false);
      return;
    }
    setPreview(data.rows);
    setValidCount(data.validCount);
    setInvalidCount(data.invalidCount);
    setStep("preview");
    setLoading(false);
  }

  async function confirmImport() {
    setLoading(true);
    const res = await fetch("/api/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: rawRows, commit: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Import failed");
      setLoading(false);
      return;
    }
    setImported(data.imported);
    setStep("done");
    setLoading(false);
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/students")}
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Import Students</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Bulk-register students from a CSV file with validation and preview
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {step === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center hover:border-indigo-500/50 transition-colors">
                {loading ? (
                  <Loader2 className="w-12 h-12 mx-auto text-indigo-500 mb-3 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                )}
                <p className="text-[var(--text-primary)] font-medium mb-1">
                  Click to upload a CSV file
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Columns: Name, USN, Course, Department, Semester, Academic Year, Email, Phone
                </p>
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </div>

          <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">Need a template?</h3>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Download a sample CSV with the correct column headers and two example rows.
                </p>
                <button onClick={downloadSample} className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === "preview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{preview.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Rows</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{validCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Valid</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{invalidCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Invalid / Duplicate</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full">
                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">USN</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Course</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Semester</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {preview.map((r) => (
                    <tr key={r.row} className={r.errors.length ? "bg-red-500/5" : ""}>
                      <td className="px-3 py-2 text-sm text-[var(--text-muted)]">{r.row}</td>
                      <td className="px-3 py-2 text-sm text-[var(--text-primary)]">{r.name || "—"}</td>
                      <td className="px-3 py-2 text-sm font-mono text-[var(--text-primary)]">{r.usn || "—"}</td>
                      <td className="px-3 py-2 text-sm text-[var(--text-primary)]">{r.course || "—"}</td>
                      <td className="px-3 py-2 text-sm text-[var(--text-primary)]">{r.semester || "—"}</td>
                      <td className="px-3 py-2">
                        {r.errors.length === 0 ? (
                          <span className="badge badge-success">
                            <CheckCircle className="w-3 h-3 mr-1" /> Valid
                          </span>
                        ) : (
                          <span className="badge badge-danger" title={r.errors.join(", ")}>
                            <XCircle className="w-3 h-3 mr-1" />
                            {r.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invalidCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-secondary)]">
                {invalidCount} invalid row{invalidCount !== 1 ? "s" : ""} will be skipped. Only the{" "}
                {validCount} valid row{validCount !== 1 ? "s" : ""} will be imported.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep("upload")} className="btn-secondary flex-1">
              Choose Different File
            </button>
            <button
              onClick={confirmImport}
              disabled={loading || validCount === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Import {validCount} Student{validCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {step === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Import Complete!</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Successfully imported {imported} student{imported !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push("/students")} className="btn-primary">
              View Students
            </button>
            <button
              onClick={() => {
                setStep("upload");
                setPreview([]);
                setRawRows([]);
              }}
              className="btn-secondary"
            >
              Import More
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
