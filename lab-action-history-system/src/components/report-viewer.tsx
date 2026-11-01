"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Loader2, Printer, RefreshCw } from "lucide-react";

interface Column {
  key: string;
  label: string;
  format?: (v: any, row: any) => string;
}

interface ReportViewerProps {
  title: string;
  reportType: string; // student | batch | computer | session | daily | monthly | action-history
  columns: Column[];
}

const RANGES = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

export function formatDuration(seconds: number): string {
  const s = Number(seconds) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ReportViewer({ title, reportType, columns }: ReportViewerProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("type", reportType);
    params.set("range", range);
    if (range === "custom") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    }
    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    setRows(data.rows || []);
    setLoading(false);
  }, [reportType, range, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  function exportCSV() {
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const body = rows
      .map((row) =>
        columns
          .map((c) => {
            const raw = row[c.key];
            const val = c.format ? c.format(raw, row) : raw ?? "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  function exportPDF() {
    const w = window.open("", "_blank");
    if (!w) return;
    const now = new Date();
    const tableHead = columns.map((c) => `<th>${c.label}</th>`).join("");
    const tableBody = rows
      .map(
        (row) =>
          `<tr>${columns
            .map((c) => {
              const raw = row[c.key];
              const val = c.format ? c.format(raw, row) : raw ?? "";
              return `<td>${String(val)}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");

    w.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { font-family: 'Segoe UI', Arial, sans-serif; }
            body { padding: 40px; color: #1e293b; }
            .header { display:flex; align-items:center; gap:16px; border-bottom:3px solid #6366f1; padding-bottom:16px; margin-bottom:24px; }
            .logo { width:56px; height:56px; border-radius:14px; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:28px; }
            h1 { margin:0; font-size:22px; }
            .sub { color:#64748b; font-size:13px; margin-top:4px; }
            .meta { display:flex; gap:24px; font-size:12px; color:#475569; margin-bottom:20px; flex-wrap:wrap; }
            .meta b { color:#1e293b; }
            table { width:100%; border-collapse:collapse; font-size:12px; }
            th { background:#f1f5f9; text-align:left; padding:10px 12px; border-bottom:2px solid #cbd5e1; text-transform:uppercase; font-size:10px; letter-spacing:.5px; }
            td { padding:9px 12px; border-bottom:1px solid #e2e8f0; }
            tr:nth-child(even) td { background:#f8fafc; }
            .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🖥️</div>
            <div>
              <h1>College Computer Laboratory</h1>
              <div class="sub">Lab Action History Management System</div>
            </div>
          </div>
          <h2 style="margin:0 0 4px;">${title}</h2>
          <div class="meta">
            <span><b>Generated:</b> ${now.toLocaleString()}</span>
            <span><b>Records:</b> ${rows.length}</span>
            <span><b>Range:</b> ${RANGES.find((r) => r.value === range)?.label}</span>
          </div>
          <table>
            <thead><tr>${tableHead}</tr></thead>
            <tbody>${tableBody}</tbody>
          </table>
          <div class="footer">
            <span>Official college document — generated electronically</span>
            <span>Page 1</span>
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {rows.length} record{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportPDF} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Date Range
            </label>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="input">
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {range === "custom" && (
            <>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  From
                </label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  To
                </label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-[var(--text-muted)]">Generating report...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No data found</h3>
            <p className="text-sm text-[var(--text-muted)]">
              Try changing the date range or check back later
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                    className="hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    {columns.map((c) => {
                      const raw = row[c.key];
                      const val = c.format ? c.format(raw, row) : raw ?? "—";
                      return (
                        <td
                          key={c.key}
                          className="px-4 py-3 text-sm text-[var(--text-primary)] whitespace-nowrap"
                        >
                          {val}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
