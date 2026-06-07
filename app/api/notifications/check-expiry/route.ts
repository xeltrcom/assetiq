import { NextRequest, NextResponse } from 'next/server'
import { runExpiryCheck } from '@/lib/expiry'

// This endpoint is called by GitHub Actions every day at 6am
// Protected by a secret token so nobody can trigger it publicly
export async function POST(req: NextRequest) {
  const token = req.headers.get('x-cron-secret')
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runExpiryCheck()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('Expiry check failed:', err)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
