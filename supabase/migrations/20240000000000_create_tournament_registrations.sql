-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tournament_registrations table
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    partner_name TEXT,  -- For doubles/mixed events
    sport TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users"
    ON public.tournament_registrations
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users"
    ON public.tournament_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update for tournament organizers
CREATE POLICY "Allow update for authenticated users"
    ON public.tournament_registrations
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX idx_tournament_registrations_tournament_id ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_sport ON public.tournament_registrations(sport);
CREATE INDEX idx_tournament_registrations_status ON public.tournament_registrations(status);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.tournament_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 