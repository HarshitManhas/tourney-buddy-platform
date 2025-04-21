-- Create tournament_teams table
CREATE TABLE IF NOT EXISTS tournament_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_team_name_per_tournament UNIQUE (tournament_id, name)
);

-- Create tournament_matches table
CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    winner_id UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_match_number_per_round UNIQUE (tournament_id, round, match_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_sport ON tournament_teams(sport);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament_id ON tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_sport ON tournament_matches(sport);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_scheduled_time ON tournament_matches(scheduled_time);

-- Add RLS policies
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

-- Policy for tournament_teams
CREATE POLICY "Allow tournament organizers to manage teams"
    ON tournament_teams
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_teams.tournament_id
            AND tournaments.creator_id = auth.uid()
        )
    );

-- Add policy for tournament participants to create teams
CREATE POLICY "Allow tournament participants to create teams"
    ON tournament_teams
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournament_registrations
            WHERE tournament_registrations.tournament_id = tournament_teams.tournament_id
            AND tournament_registrations.user_id = auth.uid()
            AND tournament_registrations.status = 'approved'
            AND tournament_registrations.sport = tournament_teams.sport
        )
    );

-- Policy for tournament_matches
CREATE POLICY "Allow tournament organizers to manage matches"
    ON tournament_matches
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_matches.tournament_id
            AND tournaments.creator_id = auth.uid()
        )
    );

-- Policy for public read access
CREATE POLICY "Allow public read access to teams"
    ON tournament_teams
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to matches"
    ON tournament_matches
    FOR SELECT
    USING (true); 