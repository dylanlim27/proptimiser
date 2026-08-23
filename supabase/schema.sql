-- Property Agent AI CRM Schema

-- 1. Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT,
  property_type TEXT,
  budget NUMERIC,
  purpose TEXT CHECK (purpose IN ('own_stay', 'investment', 'rental')),
  timeline TEXT,
  status TEXT CHECK (status IN ('HOT', 'WARM', 'COLD')),
  last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  buying_intent_score INT DEFAULT 0,
  property_fit_score INT DEFAULT 0,
  extracted_signals JSONB DEFAULT '{}'::jsonb,
  score_explanation TEXT,
  next_action TEXT
);

-- 2. Create interactions table (for tracking messages/calls)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT CHECK (type IN ('message', 'call', 'viewing')),
  content TEXT NOT NULL
);

-- 3. Enable Row Level Security & Allow Anon Access
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to leads" ON leads;
CREATE POLICY "Allow public access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access to interactions" ON interactions;
CREATE POLICY "Allow public access to interactions" ON interactions FOR ALL USING (true) WITH CHECK (true);

-- 3. Insert some dummy data for testing
INSERT INTO leads (name, phone, property_type, budget, purpose, timeline, status, notes)
VALUES 
  ('John Doe', '+6591234567', '3BR Condo D15', 2100000, 'own_stay', 'End 2026', 'HOT', 'Hasn''t replied to viewing time.'),
  ('Sarah Lee', '+6581234567', 'Condo D9', 1800000, 'own_stay', 'Mid 2026', 'WARM', 'Looking for own stay.'),
  ('Michael Chen', '+6598765432', '2BR Rental', 4500, 'rental', 'Sept 2026', 'WARM', 'Moving in Sept.'),
  ('David Lim', '+6588765432', 'HDB', 600000, 'own_stay', 'No rush', 'COLD', 'Cold lead, no rush.');
