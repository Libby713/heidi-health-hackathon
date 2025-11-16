import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUESTION_TEMPLATES = {
  onset: {
    question: "When did your chest pain start?",
    options: [
      "Less than 1 hour ago",
      "1-6 hours ago",
      "6-24 hours ago",
      "1-3 days ago",
      "More than 3 days ago",
      "It comes and goes (intermittent)"
    ]
  },
  character: {
    question: "How would you describe the pain?",
    options: [
      "Pressure or squeezing",
      "Tightness",
      "Heavy feeling",
      "Burning sensation",
      "Sharp pain",
      "Stabbing pain",
      "Like indigestion"
    ]
  },
  location: {
    question: "Where exactly is the pain located?",
    options: [
      "Center of chest",
      "Left side of chest",
      "Right side of chest",
      "Behind breastbone",
      "Upper abdomen",
      "Spread across chest"
    ]
  },
  radiation: {
    question: "Does the pain spread to any other areas?",
    options: [
      "Left arm",
      "Right arm",
      "Both arms",
      "Jaw",
      "Neck",
      "Back",
      "No, it stays in one place"
    ]
  },
  severity: {
    question: "On a scale of 1-10, how severe is the pain?",
    options: [
      "1-2 (Mild)",
      "3-4 (Mild to moderate)",
      "5-6 (Moderate)",
      "7-8 (Severe)",
      "9-10 (Worst pain ever)"
    ]
  },
  triggers: {
    question: "What makes the pain worse?",
    options: [
      "Physical activity or exertion",
      "Stress or anxiety",
      "Eating",
      "Deep breathing",
      "Pressing on chest",
      "Lying down",
      "Nothing specific"
    ]
  },
  relief: {
    question: "What makes the pain better?",
    options: [
      "Rest",
      "Sitting forward",
      "Antacids",
      "Pain medication",
      "Nothing helps",
      "Not sure"
    ]
  },
  associated_symptoms: {
    question: "Are you experiencing any of these symptoms?",
    options: [
      "Shortness of breath",
      "Nausea or vomiting",
      "Sweating",
      "Dizziness or lightheadedness",
      "Heart palpitations",
      "Cough",
      "None of these"
    ]
  },
  breathing_impact: {
    question: "Does the pain change with breathing?",
    options: [
      "Yes, worse with deep breaths",
      "Yes, better with shallow breathing",
      "No change with breathing"
    ]
  },
  medical_history: {
    question: "Do you have any of these medical conditions?",
    options: [
      "Previous heart attack",
      "Angina",
      "High blood pressure",
      "Diabetes",
      "High cholesterol",
      "Previous heart surgery",
      "None of these"
    ]
  },
  recent_events: {
    question: "Have you experienced any of these recently?",
    options: [
      "Long flight or travel",
      "Leg swelling or pain",
      "Recent surgery",
      "Prolonged bed rest",
      "Injury to chest",
      "None of these"
    ]
  }
};

const ENHANCED_SYSTEM_PROMPT = `You are a medical assessment AI conducting structured clinical evaluations.

SUPPORTED PATHWAYS:
- Cardiac Chest Pain (PRIMARY): Structured chest pain evaluation following established clinical protocols
- Respiratory Issues: Breathlessness, cough, and respiratory symptom assessment
- Abdominal Pain: Digestive and abdominal complaint evaluation
- Neurological Symptoms: Headache, dizziness, weakness, and neurological assessment
- General Assessment: Flexible symptom evaluation

CURRENT DEMO: Cardiac Chest Pain Assessment for Patient Intake

RESPONSE FORMAT - CRITICAL:
You MUST respond with a JSON object containing:
{
  "message": "your empathetic response and question",
  "question_type": "one of: onset|character|location|radiation|severity|triggers|relief|associated_symptoms|breathing_impact|medical_history|recent_events|free_form",
  "analysis": "brief clinical note about the response (internal)"
}

IMPORTANT:
- Keep messages empathetic and concise (1-2 sentences)
- Follow the structured pathway for chest pain assessment
- Always respond with valid JSON
- Guide patients through systematic symptom evaluation`;

export async function POST(request: Request) {
  try {
    console.log('[v0] ===== PATIENT API CONNECTION DIAGNOSTICS =====');
    console.log('[v0] API route received request at:', new Date().toISOString());
    
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPHIC_API_KEY;
    
    if (!apiKey) {
      console.error('[v0] CRITICAL: No API key found');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured. Please add ANTHROPIC_API_KEY in Vars.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { messages }: { messages: Message[] } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[v0] Calling Claude API');
    const startTime = Date.now();

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        temperature: 0.3,
        system: ENHANCED_SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      console.error('[v0] Claude API error:', errorData);
      throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
    }

    const data = await anthropicResponse.json();
    const responseText = data.content[0]?.text || '';
    
    console.log('[v0] Claude response received:', responseText.substring(0, 200));

    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      console.log('[v0] Non-JSON response, using fallback');
      parsedResponse = {
        message: responseText,
        question_type: 'free_form'
      };
    }

    const messageContent = typeof parsedResponse.message === 'string' 
      ? parsedResponse.message 
      : responseText;

    const questionTemplate = QUESTION_TEMPLATES[parsedResponse.question_type as keyof typeof QUESTION_TEMPLATES];
    const options = questionTemplate ? questionTemplate.options : undefined;

    console.log('[v0] Response processed - Question type:', parsedResponse.question_type);
    console.log('[v0] Options provided:', !!options);
    console.log('[v0] ===== CONNECTION SUCCESSFUL =====');

    return new Response(
      JSON.stringify({
        content: messageContent,
        options: options,
        questionType: parsedResponse.question_type,
        redFlag: parsedResponse.red_flag || false
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[v0] ===== ERROR IN API ROUTE =====');
    console.error('[v0] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
