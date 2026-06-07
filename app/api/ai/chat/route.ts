import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { askAI } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

    // Give AI context about current asset data
    const [totalAssets, expiringCount, expiredCount, unassigned] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: 'EXPIRING_SOON' } }),
      prisma.asset.count({ where: { status: 'EXPIRED' } }),
      prisma.asset.count({ where: { assignedToId: null } }),
    ])

    // If user is asking about specific assets, search for them
    let assetContext = ''
    const searchTerms = message.match(/\b(laptop|desktop|server|printer|license|vehicle|asset #?[A-Z0-9-]+)\b/gi)
    if (searchTerms) {
      const found = await prisma.asset.findMany({
        where: {
          OR: searchTerms.flatMap((term: string) => [
            { name:     { contains: term, mode: 'insensitive' } },
            { assetTag: { contains: term, mode: 'insensitive' } },
            { category: { equals: term.toUpperCase().replace(' ', '_') as any } },
          ]),
        },
        take: 5,
        include: { assignedTo: { select: { name: true } } },
      })
      if (found.length) {
        assetContext = `\n\nRelevant assets found:\n${found.map(a =>
          `- ${a.name} (${a.assetTag}): ${a.status}, assigned to ${a.assignedTo?.name ?? 'nobody'}, IP: ${a.ipAddress ?? 'N/A'}`
        ).join('\n')}`
      }
    }

    const systemPrompt = `You are AssetIQ, an intelligent IT asset management assistant for Xeltr.
Current asset inventory summary:
- Total assets: ${totalAssets}
- Expiring soon: ${expiringCount}  
- Expired: ${expiredCount}
- Unassigned: ${unassigned}
${assetContext}

Help the IT admin manage assets, answer questions about the inventory, suggest actions, and flag risks.
Be concise, professional, and actionable. If you don't know something, say so.`

    const result = await askAI(message, systemPrompt)

    return NextResponse.json({
      reply: result.text,
      model: result.model,
      tier:  result.tier,
    })
  } catch (err: any) {
    console.error('AI chat error:', err)
    return NextResponse.json(
      { error: err.message === 'AI unavailable' ? 'AI service unavailable. Check your OpenAI API key.' : 'Server error' },
      { status: 500 }
    )
  }
}
