import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { nhsId, fullName, dateOfBirth } = await req.json()

    // Make API call to Anthropic with NHS ID and patient data
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `As a medical assistant, provide initial differential diagnoses for a patient with the following information:
- NHS ID: ${nhsId}
- Full Name: ${fullName}
- Date of Birth: ${dateOfBirth}

Please provide a brief summary of potential differential diagnoses based on this patient identifier.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : 'Unable to process response'

    return Response.json({ message: responseText })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return Response.json(
      { error: 'Failed to get response from Anthropic API' },
      { status: 500 }
    )
  }
}
