// Export utilities for CSV and Print — Professional templates

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(';'),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(';'))
  ];
  
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printSection(title: string, contentHtml: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const refNumber = `REF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Ferme Avicole Diallo</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
          color: #1a1a2e;
          background: #fff;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        .page {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 40px;
        }

        /* ===== HEADER BAND ===== */
        .doc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          margin-bottom: 32px;
          color: #fff;
        }

        .doc-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-logo {
          width: 52px;
          height: 52px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .doc-company {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .doc-subtitle {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          margin-top: 2px;
        }

        .doc-header-right {
          text-align: right;
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          line-height: 1.8;
        }

        .doc-header-right strong {
          color: #fff;
          font-weight: 600;
        }

        /* ===== TITLE BAR ===== */
        .doc-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 24px;
          border-bottom: 2px solid #10B981;
        }

        .doc-title {
          font-size: 22px;
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -0.3px;
        }

        .doc-ref {
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
        }

        /* ===== STATS GRID ===== */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .stat-box {
          padding: 18px 20px;
          border-radius: 14px;
          background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .stat-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #10B981;
          border-radius: 0 4px 4px 0;
        }

        .stat-box .label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-box .value {
          font-size: 22px;
          font-weight: 800;
          margin-top: 6px;
          color: #1a1a2e;
        }

        .stat-box .value.positive { color: #10B981; }
        .stat-box .value.negative { color: #F43F5E; }

        /* ===== TABLE ===== */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        thead tr {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        th {
          padding: 14px 18px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        td {
          padding: 12px 18px;
          text-align: left;
          font-size: 12.5px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:nth-child(even) {
          background: #fafbfc;
        }

        tbody tr:hover {
          background: #f0fdf4;
        }

        td.positive { color: #10B981; font-weight: 600; }
        td.negative { color: #F43F5E; font-weight: 600; }

        /* ===== FOOTER ===== */
        .doc-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .doc-footer-left {
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.8;
        }

        .doc-footer-right {
          text-align: right;
          font-size: 10px;
          color: #cbd5e1;
        }

        .doc-stamp {
          display: inline-block;
          padding: 8px 20px;
          border: 2px solid #10B981;
          border-radius: 8px;
          color: #10B981;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transform: rotate(-3deg);
          opacity: 0.7;
        }

        /* ===== WATERMARK ===== */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 100px;
          font-weight: 800;
          color: rgba(26, 26, 46, 0.02);
          pointer-events: none;
          white-space: nowrap;
          z-index: 0;
          letter-spacing: 10px;
        }

        /* ===== PRINT ===== */
        @media print {
          body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { padding: 24px 20px; max-width: none; }
          .doc-header { margin-bottom: 24px; padding: 20px 24px; }
          .no-print { display: none; }
        }

        @page {
          size: A4;
          margin: 15mm;
        }
      </style>
    </head>
    <body>
      <div class="watermark">FERME DIALLO</div>
      <div class="page">

        <!-- HEADER -->
        <div class="doc-header">
          <div class="doc-header-left">
            <div class="doc-logo">🐔</div>
            <div>
              <div class="doc-company">Ferme Avicole Diallo</div>
              <div class="doc-subtitle">Gestion Avicole Professionnelle</div>
            </div>
          </div>
          <div class="doc-header-right">
            <div><strong>Date :</strong> ${dateStr}</div>
            <div><strong>Heure :</strong> ${timeStr}</div>
            <div><strong>Adresse :</strong> Conakry, Guinée</div>
            <div><strong>Tél :</strong> +224 XXX XXX XXX</div>
          </div>
        </div>

        <!-- TITLE -->
        <div class="doc-title-bar">
          <div class="doc-title">${title}</div>
          <div class="doc-ref">${refNumber}</div>
        </div>

        <!-- CONTENT -->
        ${contentHtml}

        <!-- FOOTER -->
        <div class="doc-footer">
          <div class="doc-footer-left">
            <div>Document généré automatiquement — Ferme Avicole Diallo</div>
            <div>Système de gestion avicole • ${dateStr}</div>
          </div>
          <div class="doc-footer-right">
            <div class="doc-stamp">Document officiel</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
