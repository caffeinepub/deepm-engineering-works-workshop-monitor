import type { WorkOrder } from "@/lib/types";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, "_").trim() || "file";
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSummaryHtml(weekLabel: string, orders: WorkOrder[]): string {
  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  // Group by section
  const bySection: Record<string, WorkOrder[]> = {};
  for (const order of orders) {
    const sec = order.section || "General";
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(order);
  }

  const statusColor: Record<string, string> = {
    Pending: "#d97706",
    "In Progress": "#2563eb",
    Completed: "#16a34a",
    "On Hold": "#6b7280",
  };

  const sectionTables = Object.entries(bySection)
    .map(([section, sectionOrders]) => {
      const rows = sectionOrders
        .map(
          (o) => `
        <tr>
          <td>${escapeHtml(o.title)}</td>
          <td>${escapeHtml(o.customer_name)}</td>
          <td>${escapeHtml(o.assigned_team)}</td>
          <td style="color:${statusColor[o.status] || "#ccc"}; font-weight:600;">${escapeHtml(o.status)}</td>
          <td>${o.expected_date ? new Date(o.expected_date).toLocaleDateString("en-IN") : "—"}</td>
          <td>${escapeHtml(o.description)}</td>
          <td>${escapeHtml(o.notes)}</td>
          <td>${o.photos.length}</td>
        </tr>`,
        )
        .join("\n");

      return `
      <div class="section">
        <h2>${escapeHtml(section)}</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Customer</th>
              <th>Assigned Team</th>
              <th>Status</th>
              <th>Expected Date</th>
              <th>Description</th>
              <th>Notes</th>
              <th>Photos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Work Orders - ${escapeHtml(weekLabel)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f1117;
      color: #e2e8f0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      padding: 2rem;
      line-height: 1.5;
    }
    header {
      border-bottom: 2px solid #2d3748;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f0f4ff;
      letter-spacing: -0.02em;
    }
    header .meta {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
    }
    header .badge {
      display: inline-block;
      background: #1a2035;
      border: 1px solid #2d3748;
      border-radius: 4px;
      padding: 0.2rem 0.6rem;
      font-size: 0.75rem;
      color: #90cdf4;
      margin-right: 0.5rem;
    }
    .section {
      margin-bottom: 2.5rem;
    }
    .section h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #90cdf4;
      margin-bottom: 0.75rem;
      padding: 0.4rem 0.75rem;
      background: #1a2035;
      border-left: 3px solid #4299e1;
      border-radius: 0 4px 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    thead tr {
      background: #1a2035;
    }
    th {
      text-align: left;
      padding: 0.6rem 0.75rem;
      color: #a0aec0;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #2d3748;
    }
    td {
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #1a2035;
      vertical-align: top;
      max-width: 220px;
      word-break: break-word;
    }
    tr:hover td {
      background: #1a2035;
    }
    .total {
      margin-top: 2rem;
      padding: 0.75rem 1rem;
      background: #1a2035;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #a0aec0;
    }
    .total strong { color: #f0f4ff; }
    footer {
      margin-top: 3rem;
      border-top: 1px solid #2d3748;
      padding-top: 1rem;
      font-size: 0.75rem;
      color: #4a5568;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <h1>Work Orders — ${escapeHtml(weekLabel)}</h1>
    <div class="meta">
      <span class="badge">${orders.length} order${orders.length !== 1 ? "s" : ""}</span>
      <span class="badge">${Object.keys(bySection).length} section${Object.keys(bySection).length !== 1 ? "s" : ""}</span>
      <span style="color:#718096;">Generated: ${generatedDate}</span>
    </div>
  </header>

  ${sectionTables}

  <div class="total">
    Total work orders this week: <strong>${orders.length}</strong>
  </div>

  <footer>
    Deepam Engineering Works · Workshop Monitor · Auto-generated report
  </footer>
</body>
</html>`;
}

export async function downloadWeekFolder(
  weekLabel: string,
  orders: WorkOrder[],
): Promise<void> {
  const weekOrders = orders.filter((o) => o.week_label === weekLabel);
  if (weekOrders.length === 0) return;

  // Generate HTML report and download directly (no zip dependency needed)
  const html = buildSummaryHtml(weekLabel, weekOrders);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const today = new Date().toISOString().slice(0, 10);
  const safeName = sanitizeFilename(weekLabel);
  const filename = `WorkOrders_${safeName}_${today}.html`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
