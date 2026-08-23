import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lead, instructions } = await req.json();

    const prompt = `
You are an expert property agent assistant. Draft a WhatsApp message for a client based on the following details.
Keep it professional, polite, and persuasive, but not overly salesy. Use emojis sparingly.

Client Details:
- Name: ${lead.name || 'Client'}
- Budget: $${lead.budget || 'N/A'}
- Property Type: ${lead.property_type || 'N/A'}
- Purpose: ${lead.purpose || 'N/A'}
- Status: ${lead.status || 'N/A'}

Additional instructions from the agent:
"${instructions}"

Draft ONLY the WhatsApp message text. Do not include any other commentary.
`;

    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      prompt: prompt,
    });

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('Error generating reply:', error);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
