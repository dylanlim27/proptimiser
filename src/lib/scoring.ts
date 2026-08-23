export interface ExtractedSignals {
  // Buying Intent Signals
  viewing_requested: boolean;
  has_specific_timeline: boolean;
  high_budget_qualified: boolean;
  replied_quickly: boolean;
  asked_multiple_questions: boolean;
  enquiry_very_recent: boolean;
  no_reply_7_days: boolean;
  very_vague_enquiry: boolean;
  timeline_over_12_months: boolean;
  
  // Property Fit Signals
  budget_matches_property: boolean;
  property_type_matches: boolean;
  location_matches: boolean;
}

export function calculateScores(signals: Partial<ExtractedSignals>) {
  let intentScore = 30; // Base intent score
  let fitScore = 30;    // Base fit score

  // 1. Calculate Buying Intent Score
  if (signals.viewing_requested) intentScore += 25;
  if (signals.has_specific_timeline) intentScore += 15;
  if (signals.high_budget_qualified) intentScore += 10;
  if (signals.replied_quickly) intentScore += 5;
  if (signals.asked_multiple_questions) intentScore += 10;
  if (signals.enquiry_very_recent) intentScore += 5;
  
  if (signals.no_reply_7_days) intentScore -= 15;
  if (signals.very_vague_enquiry) intentScore -= 10;
  if (signals.timeline_over_12_months) intentScore -= 10;

  // 2. Calculate Property Fit Score
  if (signals.budget_matches_property) fitScore += 40;
  if (signals.property_type_matches) fitScore += 20;
  if (signals.location_matches) fitScore += 10;
  
  // Clamp scores between 0 and 100
  intentScore = Math.max(0, Math.min(100, intentScore));
  fitScore = Math.max(0, Math.min(100, fitScore));

  return { intentScore, fitScore };
}

export function getStatusFromScore(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 80) return 'HOT';
  if (score >= 50) return 'WARM';
  return 'COLD';
}

const STATUS_PRIORITY: Record<string, number> = {
  HOT: 1,
  WARM: 2,
  COLD: 3,
};

export function sortLeadsByStatus<T extends { status: string; buying_intent_score?: number }>(leads: T[]): T[] {
  return [...leads].sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status] || 99;
    const priorityB = STATUS_PRIORITY[b.status] || 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Secondary sort: highest score first
    const scoreA = a.buying_intent_score ?? 0;
    const scoreB = b.buying_intent_score ?? 0;
    return scoreB - scoreA;
  });
}
