"use client";

import { FileText, TrendingUp, Users, Layers, Activity, Monitor, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

const reports = [
  { title: "Student Report", description: "Individual student sessions, lab time & activity", icon: Users, href: "/reports/students", color: "from-indigo-500 to-purple-600" },
  { title: "Batch Report", description: "Batch-wise statistics, participation & usage", icon: Layers, href: "/reports/batches", color: "from-cyan-500 to-blue-600" },
  { title: "Session Report", description: "Detailed session history with durations", icon: Activity, href: "/reports/sessions", color: "from-green-500 to-emerald-600" },
  { title: "Computer Usage Report", description: "Per-computer usage & utilization trends", icon: Monitor, href: "/reports/computers", color: "from-orange-500 to-red-600" },
  { title: "Daily Report", description: "Day-wise session summaries", icon: Calendar, href: "/reports/daily", color: "from-pink-500 to-rose-600" },
  { title: "Monthly Report", description: "Monthly trends and analytics", icon: TrendingUp, href: "/reports/monthly", color: "from-yellow-500 to-amber-600" },
  { title: "Action History Report", description: "Complete activity timeline across sessions", icon: ClipboardList, href: "/reports/action-history", color: "from-violet-500 to-fuchsia-600" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Generate professional reports with CSV and PDF export
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.href}
              href={report.href}
              className="card p-6 hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{report.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{report.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <FileText className="w-3.5 h-3.5" />
                CSV + PDF export
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Professional PDF Documents</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Every report can be exported as a formatted PDF with the college header,
              generation date, record counts, and page footer — ready to print as an
              official laboratory document. Open any report and click <b>PDF</b> or <b>CSV</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
