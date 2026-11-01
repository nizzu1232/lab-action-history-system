"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function DailyReportPage() {
  return (
    <ReportViewer
      title="Daily Report"
      reportType="daily"
      columns={[
        { key: "period", label: "Date" },
        { key: "totalSessions", label: "Sessions" },
        { key: "uniqueStudents", label: "Unique Students" },
        { key: "totalDuration", label: "Total Lab Time", format: (v) => formatDuration(v) },
      ]}
    />
  );
}
