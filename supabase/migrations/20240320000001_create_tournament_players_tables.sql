-- Create tournament_players table
CREATE TABLE IF NOT EXISTS tournament_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_players table (for auction sports)
CREATE TABLE IF NOT EXISTS team_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES tournament_players(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_player_per_team UNIQUE (team_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament_id ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_sport ON tournament_players(sport);
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_player_id ON team_players(player_id);

-- Add RLS policies
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Policy for tournament_players
CREATE POLICY "Allow tournament organizers to manage players"
    ON tournament_players
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE tournaments.id = tournament_players.tournament_id
            AND tournaments.creator_id = auth.uid()
        )
    );

-- Policy for team_players
CREATE POLICY "Allow tournament organizers to manage team players"
    ON team_players
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tournament_teams
            JOIN tournaments ON tournaments.id = tournament_teams.tournament_id
            WHERE tournament_teams.id = team_players.team_id
            AND tournaments.creator_id = auth.uid()
        )
    );

-- Policy for public read access
CREATE POLICY "Allow public read access to players"
    ON tournament_players
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to team players"
    ON team_players
    FOR SELECT
    USING (true); 