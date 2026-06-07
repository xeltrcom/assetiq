import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function getSeverityColor(severity: string) {
  if (severity === 'CRITICAL') return { bg: '#FCEBEB', border: '#F09595', text: '#791F1F', icon: '🔴' }
  if (severity === 'WARNING')  return { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', icon: '🟡' }
  return                              { bg: '#E6F1FB', border: '#85B7EB', text: '#0C447C', icon: '🔵' }
}

export async function sendExpiryEmail({
  to, subject, asset, daysLeft, label, severity, expiryDate,
}: {
  to: string
  subject: string
  asset: any
  daysLeft: number
  label: string
  severity: string
  expiryDate: Date
}) {
  const c = getSeverityColor(severity)
  const urgencyLabel = daysLeft <= 0 ? 'Overdue' : daysLeft <= 5 ? 'Urgent' : daysLeft <= 14 ? 'Action needed' : 'Informational'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1EFE8;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFE8;padding:32px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #D3D1C7">

        <!-- Header -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #D3D1C7;background:#ffffff">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-size:18px;font-weight:700;color:#534AB7">Asset</span><span style="font-size:18px;font-weight:700;color:#2C2C2A">IQ</span></td>
                <td align="right"><span style="background:${c.bg};color:${c.text};border:1px solid ${c.border};padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600">${urgencyLabel}</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="padding:20px 28px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};border:1px solid ${c.border};border-radius:8px">
              <tr>
                <td style="padding:14px 16px">
                  <p style="margin:0;font-size:13px;color:${c.text};line-height:1.5">${c.icon} <strong>${subject}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Asset details -->
        <tr>
          <td style="padding:0 28px 20px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D3D1C7;border-radius:8px;overflow:hidden">
              ${[
                ['Asset name',    asset.name],
                ['Asset tag',     asset.assetTag],
                [label + ' expiry', expiryDate.toDateString()],
                ['Days remaining', daysLeft <= 0 ? `Expired ${Math.abs(daysLeft)} day(s) ago` : `${daysLeft} days`],
                ['Status',        asset.status],
                ['Assigned to',   asset.assignedTo?.name ?? 'Unassigned'],
              ].map(([k, v], i) => `
              <tr style="background:${i % 2 === 0 ? '#ffffff' : '#F8F7F5'}">
                <td style="padding:9px 14px;font-size:12px;color:#888780;width:40%">${k}</td>
                <td style="padding:9px 14px;font-size:12px;color:#2C2C2A;font-weight:500">${v}</td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 28px 24px">
            <a href="${process.env.APP_URL}/assets/${asset.id}" style="display:inline-block;background:#534AB7;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600">View asset in AssetIQ →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #D3D1C7;background:#F8F7F5">
            <p style="margin:0;font-size:11px;color:#B4B2A9">Powered by <strong style="color:#534AB7">Xeltr</strong> · AssetIQ · This is an automated alert. <a href="${process.env.APP_URL}/settings/notifications" style="color:#534AB7">Manage notification settings</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to,
    subject: `[AssetIQ] ${subject}`,
    html,
  })
}

export async function sendApprovalEmail({
  to, name, status, role,
}: {
  to: string
  name: string
  status: string
  role: string
}) {
  const approved = status === 'APPROVED'
  const subject  = approved
    ? '[AssetIQ] Your account has been approved!'
    : '[AssetIQ] Your access request has been declined'

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrator', ASSET_MANAGER: 'Asset Manager',
    DEPT_MANAGER: 'Department Manager', USER: 'Employee', VIEWER: 'Viewer',
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F1EFE8;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EFE8;padding:32px 0">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #D3D1C7">
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #D3D1C7">
            <span style="font-size:18px;font-weight:700;color:#534AB7">Asset</span><span style="font-size:18px;font-weight:700;color:#2C2C2A">IQ</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px">
            <p style="font-size:16px;font-weight:600;color:#2C2C2A;margin:0 0 12px">Hi ${name},</p>
            ${approved ? `
            <p style="font-size:13px;color:#555;margin:0 0 16px;line-height:1.6">
              Great news! Your AssetIQ account has been approved. You now have access as <strong>${ROLE_LABELS[role] ?? role}</strong>.
            </p>
            <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;background:#534AB7;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600">
              Go to dashboard →
            </a>
            ` : `
            <p style="font-size:13px;color:#555;margin:0 0 16px;line-height:1.6">
              Unfortunately, your access request for AssetIQ has been declined. Please contact your IT administrator for more information.
            </p>
            `}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #D3D1C7;background:#F8F7F5">
            <p style="margin:0;font-size:11px;color:#B4B2A9">Powered by <strong style="color:#534AB7">Xeltr</strong> · AssetIQ</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html })
}
