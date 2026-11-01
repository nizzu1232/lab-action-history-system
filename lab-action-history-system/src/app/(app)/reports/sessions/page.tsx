"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function SessionReportPage() {
  return (
    <ReportViewer
      title="Session Report"
      reportType="session"
      columns={[
        { key: "id", label: "Session ID" },
        { key: "studentName", label: "Student" },
        { key: "studentUsn", label: "USN" },
        { key: "batchName", label: "Batch" },
        { key: "computerNumber", label: "Computer" },
        { key: "startTime", label: "Start", format: (v) => (v ? new Date(v).toLocaleString() : "—") },
        { key: "endTime", label: "End", format: (v) => (v ? new Date(v).toLocaleString() : "Active") },
        { key: "durationSeconds", label: "Duration", format: (v) => formatDuration(v) },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
