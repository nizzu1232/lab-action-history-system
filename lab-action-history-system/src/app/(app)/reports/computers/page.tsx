"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function ComputerReportPage() {
  return (
    <ReportViewer
      title="Computer Usage Report"
      reportType="computer"
      columns={[
        { key: "computerNumber", label: "Computer" },
        { key: "location", label: "Location" },
        { key: "status", label: "Current Status" },
        { key: "totalSessions", label: "Total Sessions" },
        { key: "totalDuration", label: "Total Usage", format: (v) => formatDuration(v) },
      ]}
    />
  );
}
