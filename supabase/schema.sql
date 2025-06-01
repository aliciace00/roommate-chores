-- Create households table
CREATE TABLE households (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create roommates table
CREATE TABLE roommates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chores table
CREATE TABLE chores (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    assigned_to UUID REFERENCES roommates(id) ON DELETE SET NULL,
    frequency INTEGER NOT NULL CHECK (frequency > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_completed TIMESTAMP WITH TIME ZONE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE
);

-- Create RLS policies
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;

-- Household policies
CREATE POLICY "Households are viewable by members" ON households
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE roommates.household_id = households.id
            AND roommates.id = auth.uid()
        )
    );

CREATE POLICY "Households can be created by anyone" ON households
    FOR INSERT WITH CHECK (true);

-- Roommate policies
CREATE POLICY "Roommates are viewable by household members" ON roommates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roommates r2
            WHERE r2.household_id = roommates.household_id
            AND r2.id = auth.uid()
        )
    );

CREATE POLICY "Roommates can be created by household members" ON roommates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE household_id = NEW.household_id
            AND id = auth.uid()
        )
    );

-- Chore policies
CREATE POLICY "Chores are viewable by household members" ON chores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE roommates.household_id = chores.household_id
            AND roommates.id = auth.uid()
        )
    );

CREATE POLICY "Chores can be created by household members" ON chores
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE household_id = NEW.household_id
            AND id = auth.uid()
        )
    );

CREATE POLICY "Chores can be updated by household members" ON chores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE household_id = chores.household_id
            AND id = auth.uid()
        )
    );

CREATE POLICY "Chores can be deleted by household members" ON chores
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM roommates
            WHERE household_id = chores.household_id
            AND id = auth.uid()
        )
    ); 