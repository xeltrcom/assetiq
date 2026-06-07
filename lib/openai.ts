import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Auto-detects if user has paid tier key and uses GPT-4o
// Falls back to GPT-3.5-turbo for free tier keys
export async function askAI(prompt: string, systemPrompt?: string) {
  // Try GPT-4o first (paid), fall back to GPT-3.5 (free)
  const models = ['gpt-4o', 'gpt-3.5-turbo']

  for (const model of models) {
    try {
      const res = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt ?? 'You are AssetIQ, an intelligent IT asset management assistant for Xeltr. Be concise and helpful.' },
          { role: 'user',   content: prompt },
        ],
        max_tokens: 800,
      })
      return {
        text:  res.choices[0].message.content ?? '',
        model: model,
        tier:  model === 'gpt-4o' ? 'paid' : 'free',
      }
    } catch (err: any) {
      // If GPT-4o fails due to plan, try next model
      if (model === 'gpt-4o' && err?.status === 429) continue
      throw err
    }
  }
  throw new Error('AI unavailable')
}

// Auto-tag an asset using AI
export async function autoTagAsset(assetName: string, description: string) {
  const result = await askAI(
    `Asset name: "${assetName}". Description: "${description}".
     Return a JSON array of 3-5 short tags that categorize this asset.
     Example: ["laptop","dell","windows","portable","i7"]
     Reply with ONLY the JSON array, nothing else.`,
  )
  try {
    return JSON.parse(result.text)
  } catch {
    return []
  }
}

// Predict maintenance based on asset data
export async function predictMaintenance(asset: {
  name: string
  category: string
  purchaseDate?: Date | null
  batteryHealth?: number | null
  lastMaintenance?: Date | null
}) {
  const result = await askAI(
    `IT Asset: ${asset.name} (${asset.category})
     Purchase date: ${asset.purchaseDate?.toISOString() ?? 'unknown'}
     Battery health: ${asset.batteryHealth ?? 'N/A'}%
     Last maintenance: ${asset.lastMaintenance?.toISOString() ?? 'unknown'}
     
     Predict: should this asset be flagged for maintenance soon?
     Reply with JSON: { "risk": "low|medium|high", "reason": "short reason", "daysUntilMaintenance": number }`,
  )
  try {
    return JSON.parse(result.text)
  } catch {
    return { risk: 'unknown', reason: 'Could not analyze', daysUntilMaintenance: null }
  }
}
