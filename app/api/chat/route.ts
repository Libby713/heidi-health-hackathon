import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const response = await fetch(
      'https://api.heidi.health/jwt?email=purplefluffy1@hotmail.com&third_party_internal_id=123',
      {
        method: 'GET',
        headers: {
          'Heidi-Api-Key': 'S0bguqmD4PyN2yMp23L6419DfjBY44D2',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.text()

    return Response.json({ message: data })
  } catch (error) {
    console.error('Heidi API error:', error)
    return Response.json(
      { error: 'Failed to get response from Heidi API' },
      { status: 500 }
    )
  }
}
