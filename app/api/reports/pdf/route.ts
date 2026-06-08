import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [assets, totalValue, categoryBreakdown, statusBreakdown] = await Promise.all([
    prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { name: true } } },
      take: 100,
    }),
    prisma.asset.aggregate({ _sum: { currentValue: true, purchasePrice: true } }),
    prisma.asset.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.asset.groupBy({ by: ['status'],   _count: { _all: true } }),
  ])

  const now     = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const total   = assets.length
  const active  = assets.filter(a => a.status === 'ACTIVE').length
  const expiring= assets.filter(a => a.status === 'EXPIRING_SOON').length
  const expired = assets.filter(a => a.status === 'EXPIRED').length

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AssetIQ Report — ${now}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #2C2C2A; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #534AB7; }
  .logo { font-size: 24px; font-weight: 700; }
  .logo span { color: #534AB7; }
  .powered { font-size: 10px; color: #888; margin-top: 4px; }
  .report-info { text-align: right; }
  .report-title { font-size: 16px; font-weight: 600; color: #2C2C2A; }
  .report-date { font-size: 11px; color: #888; margin-top: 4px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi { background: #F8F7F5; border-radius: 8px; padding: 16px; border: 1px solid #E5E3DC; }
  .kpi-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .kpi-value { font-size: 24px; font-weight: 700; color: #2C2C2A; }
  .kpi-sub { font-size: 10px; color: #888; margin-top: 2px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 13px; font-weight: 600; color: #2C2C2A; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #E5E3DC; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; font-weight: 600; color: #888; text-transform: uppercase; padding: 8px 10px; background: #F8F7F5; border-bottom: 1px solid #E5E3DC; }
  td { padding: 8px 10px; border-bottom: 1px solid #F0EEE8; font-size: 11px; }
  tr:hover td { background: #FAFAF8; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-active   { background: #EAF3DE; color: #27500A; }
  .badge-expiring { background: #FAEEDA; color: #633806; }
  .badge-expired  { background: #FCEBEB; color: #791F1F; }
  .badge-other    { background: #F0EEE8; color: #888; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E3DC; display: flex; justify-content: space-between; font-size: 10px; color: #B4B2A9; }
  .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .breakdown-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F0EEE8; font-size: 11px; }
  .breakdown-row:last-child { border-bottom: none; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo"><span>Asset</span>IQ</div>
    <div class="powered">Powered by Xeltr · xeltr.com</div>
  </div>
  <div class="report-info">
    <div class="report-title">Asset Inventory Report</div>
    <div class="report-date">Generated on ${now}</div>
  </div>
</div>

<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Total assets</div>
    <div class="kpi-value">${total}</div>
    <div class="kpi-sub">${active} active</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Purchase value</div>
    <div class="kpi-value">₹${((totalValue._sum.purchasePrice ?? 0) / 100000).toFixed(1)}L</div>
    <div class="kpi-sub">original cost</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Current value</div>
    <div class="kpi-value">₹${((totalValue._sum.currentValue ?? 0) / 100000).toFixed(1)}L</div>
    <div class="kpi-sub">book value</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Expiring soon</div>
    <div class="kpi-value" style="color:${expiring > 0 ? '#E24B4A' : '#1D9E75'}">${expiring}</div>
    <div class="kpi-sub">${expired} already expired</div>
  </div>
</div>

<div class="breakdown-grid">
  <div class="section">
    <div class="section-title">Assets by category</div>
    ${categoryBreakdown.map(c => `
    <div class="breakdown-row">
      <span>${c.category.replace('_', ' ')}</span>
      <strong>${c._count._all}</strong>
    </div>`).join('')}
  </div>
  <div class="section">
    <div class="section-title">Assets by status</div>
    ${statusBreakdown.map(s => `
    <div class="breakdown-row">
      <span>${s.status.replace('_', ' ')}</span>
      <strong>${s._count._all}</strong>
    </div>`).join('')}
  </div>
</div>

<div class="section">
  <div class="section-title">Asset inventory (latest ${Math.min(100, total)})</div>
  <table>
    <thead>
      <tr>
        <th>Asset tag</th>
        <th>Name</th>
        <th>Category</th>
        <th>Assigned to</th>
        <th>Status</th>
        <th>Purchase price</th>
        <th>Current value</th>
      </tr>
    </thead>
    <tbody>
      ${assets.map(a => `
      <tr>
        <td style="font-family:monospace;font-size:10px">${a.assetTag}</td>
        <td><strong>${a.name}</strong>${a.serialNumber ? `<br><span style="color:#888;font-size:10px">${a.serialNumber}</span>` : ''}</td>
        <td>${a.category.replace('_', ' ')}</td>
        <td>${a.assignedTo?.name ?? '—'}</td>
        <td><span class="badge badge-${a.status === 'ACTIVE' ? 'active' : a.status === 'EXPIRING_SOON' ? 'expiring' : a.status === 'EXPIRED' ? 'expired' : 'other'}">${a.status.replace('_', ' ')}</span></td>
        <td>${a.purchasePrice ? `₹${a.purchasePrice.toLocaleString('en-IN')}` : '—'}</td>
        <td>${a.currentValue ? `₹${a.currentValue.toLocaleString('en-IN')}` : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<div class="footer">
  <span>AssetIQ · Powered by Xeltr · xeltr.com</span>
  <span>Report generated ${now} · ${total} assets total</span>
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="assetiq-report-${new Date().toISOString().slice(0,10)}.html"`,
    },
  })
}
