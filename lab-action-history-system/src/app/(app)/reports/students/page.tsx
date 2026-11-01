"use client";

import ReportViewer, { formatDuration } from "@/components/report-viewer";

export default function StudentReportPage() {
  return (
    <ReportViewer
      title="Student Report"
      reportType="student"
      columns={[
        { key: "name", label: "Student" },
        { key: "usn", label: "USN" },
        { key: "course", label: "Course" },
        { key: "semester", label: "Semester" },
        { key: "status", label: "Status" },
        { key: "totalSessions", label: "Sessions" },
        { key: "totalDuration", label: "Lab Time", format: (v) => formatDuration(v) },
      ]}
    />
  );
}
