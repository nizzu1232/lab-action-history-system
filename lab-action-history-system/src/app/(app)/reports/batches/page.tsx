"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function BatchReportPage() {
  return (
    <ReportViewer
      title="Batch Report"
      reportType="batch"
      columns={[
        { key: "batchName", label: "Batch" },
        { key: "course", label: "Course" },
        { key: "semester", label: "Semester" },
        { key: "status", label: "Status" },
        { key: "studentCount", label: "Students" },
        { key: "totalSessions", label: "Sessions" },
        { key: "totalDuration", label: "Total Lab Time", format: (v) => formatDuration(v) },
      ]}
    />
  );
}
