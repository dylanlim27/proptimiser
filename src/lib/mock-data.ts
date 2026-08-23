export interface Lead {
  id: string;
  name: string;
  phone: string;
  property_type: string;
  budget: number;
  purpose: 'own_stay' | 'investment' | 'rental';
  timeline: string;
  status: 'HOT' | 'WARM' | 'COLD';
  last_contacted_at: string;
  notes: string;
  buying_intent_score?: number;
  property_fit_score?: number;
  extracted_signals?: any;
  score_explanation?: string;
  next_action?: string;
}

export const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+65 9123 4567",
    property_type: "3BR Condo D15 (Amber Park / Coastline)",
    budget: 2200000,
    purpose: "own_stay",
    timeline: "End 2026",
    status: "HOT",
    last_contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    notes: "Viewed 3BR yesterday. Hasn't replied to available viewing slots for this weekend.",
    buying_intent_score: 85,
    property_fit_score: 90,
    score_explanation: "Strong budget match + specific timeline + requested viewing.",
    next_action: "Confirm Saturday viewing.",
    extracted_signals: {
      viewing_requested: true,
      has_specific_timeline: true,
      budget_matches_property: true,
      property_type_matches: true
    }
  },
  {
    id: "2",
    name: "Sarah Lee",
    phone: "+65 8123 4567",
    property_type: "2BR / 3BR Freehold D9 (River Valley / Orchard)",
    budget: 1800000,
    purpose: "own_stay",
    timeline: "Mid 2026",
    status: "WARM",
    last_contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    notes: "Looking for own stay near River Valley Primary. Sent 2 floor plans on Wednesday."
  },
  {
    id: "3",
    name: "Michael Chen",
    phone: "+65 9876 5432",
    property_type: "2BR High Floor Rental D10",
    budget: 4800,
    purpose: "rental",
    timeline: "Sept 2026",
    status: "WARM",
    last_contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    notes: "Relocating from Hong Kong in September. Needs fully furnished unit."
  },
  {
    id: "4",
    name: "David Lim",
    phone: "+65 8876 5432",
    property_type: "5-Room HDB / Resale EC Bishan",
    budget: 950000,
    purpose: "own_stay",
    timeline: "No rush (2027)",
    status: "COLD",
    last_contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
    notes: "MOP-ing in early 2027. Cold lead, check in quarterly."
  }
];
