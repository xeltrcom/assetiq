import { prisma } from './prisma'
import { differenceInDays } from 'date-fns'
import { sendExpiryEmail } from './email'

// Days before expiry to fire each warning stage per asset type
const WARNING_STAGES: Record<string, number[]> = {
  antivirus:        [30, 14, 5, 1, 0],
  os_license:       [60, 30, 7, 1, 0],
  SOFTWARE_LICENSE: [30, 14, 5, 1, 0],
  warranty:         [90, 30, 14, 1, 0],
  VEHICLE:          [45, 14, 7, 1, 0],
  ssl_cert:         [60, 30, 7, 1, 0],
  default:          [30, 14, 5, 1, 0],
}

function getSeverity(daysLeft: number) {
  if (daysLeft <= 0)  return 'CRITICAL'
  if (daysLeft <= 5)  return 'CRITICAL'
  if (daysLeft <= 14) return 'WARNING'
  return 'INFO'
}

function getStages(category: string) {
  return WARNING_STAGES[category] ?? WARNING_STAGES.default
}

// Run this daily via GitHub Actions cron
export async function runExpiryCheck() {
  const today = new Date()
  const assets = await prisma.asset.findMany({
    where: {
      status: { not: 'RETIRED' },
      OR: [
        { warrantyExpiry:  { not: null } },
        { licenseExpiry:   { not: null } },
        { insuranceExpiry: { not: null } },
        { maintenanceDue:  { not: null } },
      ],
    },
    include: { assignedTo: true },
  })

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
  })

  let notified = 0

  for (const asset of assets) {
    const expiryDates = [
      { date: asset.warrantyExpiry,  type: 'WARRANTY_EXPIRY',   label: 'Warranty' },
      { date: asset.licenseExpiry,   type: 'LICENSE_EXPIRY',    label: 'License' },
      { date: asset.insuranceExpiry, type: 'INSURANCE_EXPIRY',  label: 'Insurance' },
      { date: asset.maintenanceDue,  type: 'MAINTENANCE_DUE',   label: 'Maintenance' },
    ]

    for (const { date, type, label } of expiryDates) {
      if (!date) continue

      const daysLeft = differenceInDays(date, today)
      const stages   = getStages(asset.category)

      if (!stages.includes(daysLeft) && daysLeft >= 0) continue
      if (daysLeft < -7) continue  // stop reminding after 7 days overdue

      const severity = getSeverity(daysLeft)
      const title    = daysLeft <= 0
        ? `${label} EXPIRED — ${asset.name}`
        : `${label} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${asset.name}`

      const message = daysLeft <= 0
        ? `${asset.name} (${asset.assetTag}) ${label.toLowerCase()} expired on ${date.toDateString()}.`
        : `${asset.name} (${asset.assetTag}) ${label.toLowerCase()} expires on ${date.toDateString()} — ${daysLeft} days remaining.`

      // Notify all admins
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId:   admin.id,
            assetId:  asset.id,
            type:     type as any,
            title,
            message,
            severity: severity as any,
          },
        })

        // Send email
        await sendExpiryEmail({
          to:       admin.email,
          subject:  title,
          asset,
          daysLeft,
          label,
          severity,
          expiryDate: date,
        })
      }

      // Also notify assigned user if different from admin
      if (asset.assignedTo && !admins.find(a => a.id === asset.assignedTo!.id)) {
        await prisma.notification.create({
          data: {
            userId:   asset.assignedTo.id,
            assetId:  asset.id,
            type:     type as any,
            title,
            message,
            severity: severity as any,
          },
        })
      }

      // Auto-update asset status
      if (daysLeft <= 5 && daysLeft > 0) {
        await prisma.asset.update({
          where: { id: asset.id },
          data:  { status: 'EXPIRING_SOON' },
        })
      } else if (daysLeft <= 0) {
        await prisma.asset.update({
          where: { id: asset.id },
          data:  { status: 'EXPIRED' },
        })
      }

      notified++
    }
  }

  return { checked: assets.length, notified }
}
