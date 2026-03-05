import type { DailyUpdate, MonthlyArchive, WeeklyReport } from "@/lib/types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function triggerDownload(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const baseStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1117;
    color: #e2e8f0;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    padding: 1.5rem;
    line-height: 1.6;
    font-size: 14px;
  }
  @media (max-width: 600px) { body { padding: 1rem; } }
  header {
    border-bottom: 2px solid #2d3748;
    padding-bottom: 1.5rem;
    margin-bottom: 2rem;
  }
  .brand {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #e07b2a;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  header h1 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #f0f4ff;
    letter-spacing: -0.02em;
  }
  .meta {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #718096;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  .badge {
    display: inline-block;
    border-radius: 4px;
    padding: 0.15rem 0.55rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .badge-morning { background: #78340f; color: #fde68a; }
  .badge-evening { background: #1e1b4b; color: #a5b4fc; }
  .badge-container { background: #7c2d12; color: #fed7aa; }
  .badge-cabin { background: #1e3a5f; color: #93c5fd; }
  .badge-painting { background: #713f12; color: #fef08a; }
  .badge-parking { background: #14532d; color: #86efac; }
  .badge-underparts { background: #431407; color: #fdba74; }
  .badge-active { background: #14532d; color: #86efac; }
  .badge-archived { background: #374151; color: #9ca3af; }
  .section-block {
    margin-bottom: 2.5rem;
  }
  .section-header {
    font-size: 1rem;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 4px 0 0 4px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .section-container { background: #7c2d12; color: #fed7aa; border-left: 4px solid #ea580c; }
  .section-cabin { background: #1e3a5f; color: #93c5fd; border-left: 4px solid #2563eb; }
  .section-painting { background: #713f12; color: #fef08a; border-left: 4px solid #ca8a04; }
  .section-parking { background: #14532d; color: #86efac; border-left: 4px solid #16a34a; }
  .section-underparts { background: #431407; color: #fdba74; border-left: 4px solid #b45309; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
    overflow-x: auto;
    display: block;
  }
  thead tr { background: #1a2035; }
  th {
    text-align: left;
    padding: 0.55rem 0.75rem;
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid #2d3748;
    white-space: nowrap;
  }
  td {
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid #1a2035;
    vertical-align: top;
    word-break: break-word;
  }
  tr:nth-child(even) td { background: #111827; }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  .summary-card {
    background: #1a2035;
    border: 1px solid #2d3748;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    text-align: center;
  }
  .summary-card .label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #718096;
    margin-bottom: 0.3rem;
  }
  .summary-card .value {
    font-size: 1.6rem;
    font-weight: 800;
    color: #f0f4ff;
    line-height: 1;
  }
  .delay-text { color: #f87171; font-weight: 600; }
  .notes-text { color: #94a3b8; font-style: italic; }
  .empty-msg { color: #4a5568; font-style: italic; padding: 1rem; text-align: center; }
  footer {
    margin-top: 3rem;
    border-top: 1px solid #2d3748;
    padding-top: 1rem;
    font-size: 0.72rem;
    color: #4a5568;
    text-align: center;
  }
`;

function buildDailyUpdateRows(updates: DailyUpdate[]): string {
  if (updates.length === 0) {
    return `<tr><td colspan="7" class="empty-msg">No updates recorded</td></tr>`;
  }
  return updates
    .map(
      (u) => `
    <tr>
      <td>${escapeHtml(formatDate(u.date))}</td>
      <td><span class="badge badge-${u.shiftType.toLowerCase()}">${escapeHtml(u.shiftType)}</span></td>
      <td>${escapeHtml(u.work_done)}</td>
      <td>${escapeHtml(u.stage_progress)}</td>
      <td>${u.delays ? `<span class="delay-text">${escapeHtml(u.delays)}</span>` : "—"}</td>
      <td class="notes-text">${escapeHtml(u.notes)}</td>
      <td>${u.photos.length > 0 ? `📷 ${u.photos.length}` : "—"}</td>
    </tr>`,
    )
    .join("\n");
}

export function downloadWeeklyReport(
  weekLabel: string,
  updates: DailyUpdate[],
  report?: WeeklyReport,
): void {
  const weekUpdates = updates.filter((u) => u.week_label === weekLabel);
  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const sections = [
    "Container",
    "Cabin",
    "Painting",
    "Parking",
    "Underparts",
  ] as const;

  const sectionBlocks = sections
    .map((sec) => {
      const sectionUpdates = weekUpdates.filter((u) => u.section === sec);
      const cssKey = sec.toLowerCase();
      const summary = report
        ? {
            Container: report.container_summary,
            Cabin: report.cabin_summary,
            Painting: report.painting_summary,
            Parking: report.parking_summary,
            Underparts: report.underparts_summary,
          }[sec]
        : "";

      return `
      <div class="section-block">
        <div class="section-header section-${cssKey}">
          ${escapeHtml(sec)} Section
          <span class="badge" style="background:rgba(255,255,255,0.15); color:inherit; margin-left:auto;">${sectionUpdates.length} update${sectionUpdates.length !== 1 ? "s" : ""}</span>
        </div>
        ${summary ? `<p style="margin-bottom:0.75rem; color:#94a3b8; font-style:italic; padding:0 0.5rem;">${escapeHtml(summary)}</p>` : ""}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Shift</th>
              <th>Work Done</th>
              <th>Stage Progress</th>
              <th>Delays / Issues</th>
              <th>Notes</th>
              <th>Photos</th>
            </tr>
          </thead>
          <tbody>
            ${buildDailyUpdateRows(sectionUpdates)}
          </tbody>
        </table>
      </div>`;
    })
    .join("\n");

  const delaysCount = weekUpdates.filter((u) => u.delays.trim()).length;
  const morningCount = weekUpdates.filter(
    (u) => u.shiftType === "Morning",
  ).length;
  const eveningCount = weekUpdates.filter(
    (u) => u.shiftType === "Evening",
  ).length;

  const dateRange = report
    ? `${formatDate(report.week_start)} – ${formatDate(report.week_end)}`
    : weekLabel;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Work Report — ${escapeHtml(weekLabel)}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <header>
    <div class="brand">Deepam Engineering Works · Workshop Monitor</div>
    <h1>Weekly Work Report</h1>
    <div style="font-size:1.1rem; font-weight:600; color:#e07b2a; margin-top:0.35rem;">${escapeHtml(weekLabel)}</div>
    <div class="meta">
      <span>${escapeHtml(dateRange)}</span>
      <span style="color:#4a5568;">·</span>
      <span>Generated: ${generatedDate}</span>
    </div>
  </header>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Updates</div>
      <div class="value" style="color:#60a5fa;">${weekUpdates.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Morning Shifts</div>
      <div class="value" style="color:#fde68a;">${morningCount}</div>
    </div>
    <div class="summary-card">
      <div class="label">Evening Shifts</div>
      <div class="value" style="color:#a5b4fc;">${eveningCount}</div>
    </div>
    <div class="summary-card">
      <div class="label">Sections Covered</div>
      <div class="value" style="color:#86efac;">${new Set(weekUpdates.map((u) => u.section)).size}</div>
    </div>
    <div class="summary-card">
      <div class="label">Delays Reported</div>
      <div class="value" style="color:#f87171;">${delaysCount}</div>
    </div>
  </div>

  ${report?.overall_notes ? `<div style="background:#1a2035; border:1px solid #2d3748; border-radius:8px; padding:1rem 1.25rem; margin-bottom:2rem;"><div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.07em; color:#718096; margin-bottom:0.5rem;">Overall Notes</div><p style="color:#cbd5e1;">${escapeHtml(report.overall_notes)}</p></div>` : ""}

  ${sectionBlocks}

  <footer>
    Deepam Engineering Works · Workshop Monitor · Weekly Report — ${escapeHtml(weekLabel)}
  </footer>
</body>
</html>`;

  const today = new Date().toISOString().slice(0, 10);
  const safeName = weekLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
  triggerDownload(html, `Weekly_Report_${safeName}_${today}.html`);
}

export function downloadMonthlyReport(
  monthLabel: string,
  archives: MonthlyArchive[],
  weeklyReports: WeeklyReport[],
  updates: DailyUpdate[],
): void {
  const archive = archives.find((a) => a.month_label === monthLabel);
  const monthReports = weeklyReports.filter(
    (r) => r.month_label === monthLabel,
  );
  const monthUpdates = updates.filter((u) => u.month_label === monthLabel);

  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const [yearStr, monthName] = monthLabel.split("_");
  const monthNum = MONTH_NAMES.indexOf(monthName) + 1;
  const displayLabel =
    monthName && yearStr ? `${monthName} ${yearStr}` : monthLabel;

  // Weekly breakdown table
  const weekRows = monthReports
    .map(
      (r) => `
    <tr>
      <td style="font-weight:600; color:#e07b2a;">${escapeHtml(r.week_label)}</td>
      <td>${escapeHtml(formatDate(r.week_start))} – ${escapeHtml(formatDate(r.week_end))}</td>
      <td style="text-align:center;">${r.total_updates}</td>
      <td class="notes-text">${escapeHtml(r.container_summary) || "—"}</td>
      <td class="notes-text">${escapeHtml(r.cabin_summary) || "—"}</td>
      <td class="notes-text">${escapeHtml(r.painting_summary) || "—"}</td>
      <td>${r.status === "archived_monthly" ? '<span class="badge badge-archived">Archived</span>' : '<span class="badge badge-active">Active</span>'}</td>
    </tr>`,
    )
    .join("\n");

  const totalContainers =
    archive?.total_containers ??
    monthUpdates.filter((u) => u.section === "Container").length;
  const totalCabins =
    archive?.total_cabins ??
    monthUpdates.filter((u) => u.section === "Cabin").length;
  const totalPaintings =
    archive?.total_paintings ??
    monthUpdates.filter((u) => u.section === "Painting").length;
  const totalParkings =
    archive?.total_parkings ??
    monthUpdates.filter((u) => u.section === "Parking").length;
  const totalUnderparts =
    archive?.total_underparts ??
    monthUpdates.filter((u) => u.section === "Underparts").length;
  const totalDelays =
    archive?.total_delays ?? monthUpdates.filter((u) => u.delays.trim()).length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Monthly Archive — ${escapeHtml(displayLabel)}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <header>
    <div class="brand">Deepam Engineering Works · Workshop Monitor</div>
    <h1>Monthly Work Report</h1>
    <div style="font-size:1.1rem; font-weight:600; color:#e07b2a; margin-top:0.35rem;">${escapeHtml(displayLabel)}</div>
    <div class="meta">
      <span>${monthReports.length} week${monthReports.length !== 1 ? "s" : ""} covered</span>
      <span style="color:#4a5568;">·</span>
      <span>${monthUpdates.length} total daily updates</span>
      <span style="color:#4a5568;">·</span>
      <span>Generated: ${generatedDate}</span>
    </div>
  </header>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Containers</div>
      <div class="value" style="color:#fb923c;">${totalContainers}</div>
    </div>
    <div class="summary-card">
      <div class="label">Cabins</div>
      <div class="value" style="color:#60a5fa;">${totalCabins}</div>
    </div>
    <div class="summary-card">
      <div class="label">Painting</div>
      <div class="value" style="color:#fde68a;">${totalPaintings}</div>
    </div>
    <div class="summary-card">
      <div class="label">Parking</div>
      <div class="value" style="color:#86efac;">${totalParkings}</div>
    </div>
    <div class="summary-card">
      <div class="label">Underparts</div>
      <div class="value" style="color:#fdba74;">${totalUnderparts}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Delays</div>
      <div class="value" style="color:#f87171;">${totalDelays}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Updates</div>
      <div class="value" style="color:#f0f4ff;">${monthUpdates.length}</div>
    </div>
  </div>

  ${archive?.overall_summary ? `<div style="background:#1a2035; border:1px solid #2d3748; border-radius:8px; padding:1rem 1.25rem; margin-bottom:2rem;"><div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.07em; color:#718096; margin-bottom:0.5rem;">Overall Monthly Summary</div><p style="color:#cbd5e1;">${escapeHtml(archive.overall_summary)}</p></div>` : ""}

  <div class="section-block">
    <div class="section-header" style="background:#1a2035; color:#90cdf4; border-left:4px solid #4299e1;">
      Weekly Breakdown
      <span class="badge" style="background:rgba(255,255,255,0.12); color:inherit; margin-left:auto;">${monthReports.length} week${monthReports.length !== 1 ? "s" : ""}</span>
    </div>
    ${
      monthReports.length === 0
        ? '<p class="empty-msg">No weekly reports found for this month</p>'
        : `<table>
      <thead>
        <tr>
          <th>Week</th>
          <th>Date Range</th>
          <th>Updates</th>
          <th>Containers</th>
          <th>Cabins</th>
          <th>Painting</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${weekRows}</tbody>
    </table>`
    }
  </div>

  ${
    monthNum > 0
      ? `<div class="section-block">
    <div class="section-header" style="background:#1a2035; color:#90cdf4; border-left:4px solid #4299e1;">
      Daily Updates — ${escapeHtml(displayLabel)}
      <span class="badge" style="background:rgba(255,255,255,0.12); color:inherit; margin-left:auto;">${monthUpdates.length} updates</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Section</th>
          <th>Shift</th>
          <th>Work Done</th>
          <th>Stage</th>
          <th>Delays</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${
          monthUpdates.length === 0
            ? `<tr><td colspan="7" class="empty-msg">No daily updates</td></tr>`
            : monthUpdates
                .map(
                  (u) => `
          <tr>
            <td>${escapeHtml(formatDate(u.date))}</td>
            <td><span class="badge badge-${(u.section || "").toLowerCase()}">${escapeHtml(u.section)}</span></td>
            <td><span class="badge badge-${u.shiftType.toLowerCase()}">${escapeHtml(u.shiftType)}</span></td>
            <td>${escapeHtml(u.work_done)}</td>
            <td>${escapeHtml(u.stage_progress)}</td>
            <td>${u.delays ? `<span class="delay-text">${escapeHtml(u.delays)}</span>` : "—"}</td>
            <td class="notes-text">${escapeHtml(u.notes)}</td>
          </tr>`,
                )
                .join("\n")
        }
      </tbody>
    </table>
  </div>`
      : ""
  }

  <footer>
    Deepam Engineering Works · Workshop Monitor · Monthly Archive — ${escapeHtml(displayLabel)}
  </footer>
</body>
</html>`;

  const today = new Date().toISOString().slice(0, 10);
  const safeName = monthLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
  triggerDownload(html, `Monthly_Report_${safeName}_${today}.html`);
}
