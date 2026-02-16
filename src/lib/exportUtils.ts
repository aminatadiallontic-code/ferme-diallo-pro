// Export utilities for CSV and Print

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
  
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - Ferme Diallo</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a2e; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #10B981; }
        .header h1 { font-size: 24px; font-weight: 800; }
        .header .date { color: #64748b; font-size: 13px; margin-left: auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        th { background: #f1f5f9; font-weight: 600; color: #334155; }
        tr:hover { background: #f8fafc; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-box { padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .stat-box .label { font-size: 12px; color: #64748b; }
        .stat-box .value { font-size: 20px; font-weight: 800; margin-top: 4px; }
        .positive { color: #10B981; }
        .negative { color: #F43F5E; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🐔 ${title}</h1>
        <span class="date">Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      ${contentHtml}
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 300);
}
