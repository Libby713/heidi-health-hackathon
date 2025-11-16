import Anthropic from '@anthropic-ai/sdk';
import { head } from '@vercel/blob'; // Import head to check blob existence

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUESTION_TEMPLATES = {
  differential_diagnosis: {
    question: "Based on the patient history, what are the key differential diagnoses?",
    options: []
  },
  examination_findings: {
    question: "What are the relevant physical examination findings?",
    options: []
  },
  investigation_results: {
    question: "Please enter investigation results or lab values",
    options: []
  },
  treatment_plan: {
    question: "What is your proposed treatment plan?",
    options: []
  },
  free_form: {
    question: "Enter additional clinical information",
    options: []
  }
};

const DOCTOR_SYSTEM_PROMPT = `You are a clinical decision support AI assisting doctors with patient assessment and management.

PATIENT CONTEXT:
You will receive patient details (name, DOB, NHS number) at the start. Use this throughout the assessment.

DOCTOR WORKFLOW:
1. Initial patient data review and differential diagnosis
2. Physical examination data entry support
3. Investigation result interpretation
4. Treatment recommendation assistance

RESPONSE FORMAT - CRITICAL:
You MUST respond with a JSON object containing:
{
  "message": "your clinical response or question",
  "question_type": "one of: differential_diagnosis|examination_findings|investigation_results|treatment_plan|free_form",
  "analysis": "brief clinical reasoning (internal)"
}

IMPORTANT:
- Provide evidence-based clinical reasoning
- Support differential diagnosis formulation
- Assist with investigation interpretation
- Always respond with valid JSON
- Keep responses professional and concise`;

export async function POST(request: Request) {
  try {
    console.log('[v0] ===== DOCTOR API CONNECTION DIAGNOSTICS =====');
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
    
    const body = await request.json();
    const { messages, nhsId, fullName, dateOfBirth } = body;

    if (!messages && nhsId && fullName && dateOfBirth) {
      console.log('[v0] Initial patient data submission - fetching from Blob');
      
      let patientHistory = 'No previous patient history found.';
      
      try {
        const blobInfo = await head(`${nhsId}.txt`);
        
        if (blobInfo && blobInfo.url) {
          console.log('[v0] Attempting to fetch from Blob:', blobInfo.url);
          
          const blobResponse = await fetch(blobInfo.url);
          
          if (blobResponse.ok) {
            patientHistory = await blobResponse.text();
            console.log('[v0] Successfully fetched patient history from Blob');
            console.log('[v0] ===== PATIENT HISTORY RETRIEVED =====');
            console.log('[v0] NHS ID:', nhsId);
            console.log('[v0] History:', patientHistory);
            console.log('[v0] =======================================');
          } else {
            console.log('[v0] Blob fetch failed with status:', blobResponse.status);
          }
        }
      } catch (blobError) {
        console.log('[v0] No existing patient history found in Blob:', blobError);
      }

      const initialPrompt = `Patient Information:
- Name: ${fullName}
- Date of Birth: ${dateOfBirth}
- NHS ID: ${nhsId}

Patient Conversation History:
${patientHistory}

Please analyze the patient's conversation history above and provide a comprehensive clinical summary in clear, readable prose. Structure your response as follows:

CHIEF COMPLAINT:
[Describe the main presenting issue]

SYMPTOM CHARACTERISTICS:
[Detail onset, duration, severity, quality, and progression]

ASSOCIATED SYMPTOMS:
[List any additional symptoms mentioned]

RED FLAGS:
[Note any concerning features requiring urgent attention]

CLINICAL IMPRESSION:
[Provide your overall assessment]

Write in clear, professional medical language suitable for clinical handover. Do NOT use JSON format - provide natural, readable text.`;

      const summarySystemPrompt = `You are a clinical decision support AI providing clear, readable summaries for doctors. 

Provide concise, professional clinical summaries in natural prose format. Structure information clearly with headings, but write in complete sentences and paragraphs - NOT in JSON format.

Focus on:
- Clinical relevance
- Evidence-based reasoning
- Clear communication
- Professional medical language`;

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
          system: summarySystemPrompt,
          messages: [{ role: 'user', content: initialPrompt }],
        }),
      });

      if (!anthropicResponse.ok) {
        const errorData = await anthropicResponse.json();
        console.error('[v0] Claude API error:', errorData);
        throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
      }

      const data = await anthropicResponse.json();
      const responseText = data.content[0]?.text || '';
      
      const messageContent = responseText;

      console.log('[v0] ===== CLINICAL SUMMARY FOR DOCTOR =====');
      console.log('[v0] NHS ID:', nhsId);
      console.log('[v0] Summary:', messageContent);
      console.log('[v0] =======================================');
      
      console.log('[v0] ===== INITIAL ASSESSMENT WITH PATIENT HISTORY SUCCESSFUL =====');

      return new Response(
        JSON.stringify({
          content: messageContent,
          questionType: 'free_form'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle ongoing conversation
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[v0] Calling Claude API for ongoing conversation');

    let systemPrompt = DOCTOR_SYSTEM_PROMPT;
    if (nhsId && fullName && dateOfBirth) {
      systemPrompt += `\n\nCURRENT PATIENT:\nName: ${fullName}\nDOB: ${dateOfBirth}\nNHS Number: ${nhsId}`;
    }

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
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      console.error('[v0] Claude API error:', errorData);
      throw new Error(`Claude API error: ${JSON.stringify(errorData)}`);
    }

    const data = await anthropicResponse.json();
    const responseText = data.content[0]?.text || '';
    
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      parsedResponse = {
        message: responseText,
        question_type: 'free_form'
      };
    }

    const messageContent = typeof parsedResponse.message === 'string' 
      ? parsedResponse.message 
      : responseText;

    console.log('[v0] ===== CONNECTION SUCCESSFUL =====');

    return new Response(
      JSON.stringify({
        content: messageContent,
        questionType: parsedResponse.question_type
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
