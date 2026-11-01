"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function MonthlyReportPage() {
  return (
    <ReportViewer
      title="Monthly Report"
      reportType="monthly"
      columns={[
        { key: "period", label: "Month" },
        { key: "totalSessions", label: "Sessions" },
        { key: "uniqueStudents", label: "Unique Students" },
        { key: "totalDuration", label: "Total Lab Time", format: (v) => formatDuration(v) },
      ]}
    />
  );
}
