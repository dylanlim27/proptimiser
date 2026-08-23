import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateScores, getStatusFromScore } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { leadId, conversation, propertyContext } = await req.json();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation text is required' }, { status: 400 });
    }

    const { object: extracted } = await generateObject({
      model: google('gemini-3.6-flash'),
      schema: z.object({
        signals: z.object({
          viewing_requested: z.boolean().describe("Did the client ask to view the property or arrange a meeting?"),
          has_specific_timeline: z.boolean().describe("Did the client mention a specific moving/purchase timeline?"),
          high_budget_qualified: z.boolean().describe("Is their budget explicitly very high or are they financially qualified?"),
          replied_quickly: z.boolean().describe("Are they replying quickly or showing urgency in their messages?"),
          asked_multiple_questions: z.boolean().describe("Did the client ask multiple specific questions about the property?"),
          enquiry_very_recent: z.boolean().describe("Is the enquiry or interest from today or very recently?"),
          no_reply_7_days: z.boolean().describe("Has it been more than 7 days since their last meaningful reply?"),
          very_vague_enquiry: z.boolean().describe("Is the enquiry extremely vague (e.g., 'Just looking', 'No rush')?"),
          timeline_over_12_months: z.boolean().describe("Is their timeline more than 12 months away?"),
          budget_matches_property: z.boolean().describe("Does their stated budget match the asking price or typical price of the property?"),
          property_type_matches: z.boolean().describe("Does their requested property type match what the agent is selling?"),
          location_matches: z.boolean().describe("Does their requested location match the property location?"),
        }),
        explanation: z.string().describe("A very short 1-sentence explanation of the score based on the key signals extracted."),
        next_action: z.string().describe("A short recommended next action for the agent to take (e.g., 'Confirm Saturday viewing').")
      }),
      prompt: `
        Analyze the following conversation with a property lead.
        Extract the boolean signals exactly as defined in the schema.
        
        Property Context:
        ${propertyContext || 'None provided'}
        
        Conversation:
        ${conversation}
      `,
    });

    // Run deterministic scoring based on extracted signals
    const { intentScore, fitScore } = calculateScores(extracted.signals);
    const newStatus = getStatusFromScore(intentScore);

    const updatePayload = {
      buying_intent_score: intentScore,
      property_fit_score: fitScore,
      extracted_signals: extracted.signals,
      score_explanation: extracted.explanation,
      next_action: extracted.next_action,
      status: newStatus,
      last_contacted_at: new Date().toISOString(),
    };

    // Attempt to update database if Supabase is connected
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && leadId && leadId.length > 5) {
      const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId);
      
      if (error) {
        console.error("Failed to update lead in DB:", error);
      }
    }

    return NextResponse.json(updatePayload);

  } catch (error) {
    console.error('Error extracting signals:', error);
    return NextResponse.json({ error: 'Failed to extract signals' }, { status: 500 });
  }
}
