-- Drop existing table and related objects
DROP TABLE IF EXISTS chore_history CASCADE;

CREATE TABLE chore_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  chore_id BIGINT REFERENCES chores(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES roommates(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE chore_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for testing" ON chore_history
  FOR ALL USING (true);

-- Add indexes
CREATE INDEX chore_history_household_id_idx ON chore_history(household_id);
CREATE INDEX chore_history_chore_id_idx ON chore_history(chore_id);
CREATE INDEX chore_history_completed_by_idx ON chore_history(completed_by);
CREATE INDEX chore_history_completed_at_idx ON chore_history(completed_at); 