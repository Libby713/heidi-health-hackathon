import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: messages,
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    return Response.json({ message: text })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return Response.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    )
  }
}
