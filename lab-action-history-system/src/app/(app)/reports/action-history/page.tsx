"use client";

import ReportViewer from "@/components/report-viewer";

export default function ActionHistoryReportPage() {
  return (
    <ReportViewer
      title="Action History Report"
      reportType="action-history"
      columns={[
        { key: "timestamp", label: "Time", format: (v) => new Date(v).toLocaleString() },
        { key: "studentName", label: "Student" },
        { key: "studentUsn", label: "USN" },
        { key: "computerNumber", label: "Computer" },
        { key: "actionType", label: "Action" },
        { key: "description", label: "Description" },
      ]}
    />
  );
}
