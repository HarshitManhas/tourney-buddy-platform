-- Drop existing tournaments table if it exists
DROP TABLE IF EXISTS tournaments CASCADE;

-- Create tournaments table with all necessary fields
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_name TEXT NOT NULL,
    about TEXT,
    start_date DATE,
    end_date DATE,
    registration_due_date DATE,
    due_time TIME,
    registration_start_date DATE,
    registration_end_date DATE,
    event_start_time TIME,
    event_end_time TIME,
    check_in_start_time TIME,
    check_in_end_time TIME,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    pin_code TEXT,
    sport TEXT,
    format TEXT,
    entry_fee INTEGER,
    team_limit INTEGER,
    teams_registered INTEGER DEFAULT 0,
    participants_registered INTEGER DEFAULT 0,
    creator_id UUID REFERENCES auth.users(id),
    user_id UUID REFERENCES auth.users(id),
    banner_url TEXT,
    logo_url TEXT,
    image_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_sports table
CREATE TABLE tournament_sports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    event_name TEXT NOT NULL,
    format TEXT,
    max_teams INTEGER,
    max_participants INTEGER,
    gender TEXT,
    entry_fee INTEGER,
    play_type TEXT,
    additional_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_tournaments_creator_id ON tournaments(creator_id);
CREATE INDEX idx_tournaments_user_id ON tournaments(user_id);
CREATE INDEX idx_tournament_sports_tournament_id ON tournament_sports(tournament_id);

-- Add RLS policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_sports ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "Public tournaments are viewable by everyone"
    ON tournaments FOR SELECT
    USING (true);

CREATE POLICY "Users can create tournaments"
    ON tournaments FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own tournaments"
    ON tournaments FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own tournaments"
    ON tournaments FOR DELETE
    USING (auth.uid() = creator_id);

-- Create policies for tournament_sports
CREATE POLICY "Tournament sports are viewable by everyone"
    ON tournament_sports FOR SELECT
    USING (true);

CREATE POLICY "Users can create sports for their tournaments"
    ON tournament_sports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE id = tournament_id
            AND creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sports for their tournaments"
    ON tournament_sports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE id = tournament_id
            AND creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sports from their tournaments"
    ON tournament_sports FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tournaments
            WHERE id = tournament_id
            AND creator_id = auth.uid()
        )
    );

-- Add comments to the columns
COMMENT ON TABLE tournaments IS 'Stores information about tournaments';
COMMENT ON TABLE tournament_sports IS 'Stores sports configuration for tournaments';

COMMENT ON COLUMN tournaments.tournament_name IS 'The name of the tournament';
COMMENT ON COLUMN tournaments.about IS 'Description of the tournament';
COMMENT ON COLUMN tournaments.start_date IS 'Start date of the tournament';
COMMENT ON COLUMN tournaments.end_date IS 'End date of the tournament';
COMMENT ON COLUMN tournaments.registration_due_date IS 'Last date for registration';
COMMENT ON COLUMN tournaments.due_time IS 'Time for registration deadline';
COMMENT ON COLUMN tournaments.registration_start_date IS 'Start date for registration';
COMMENT ON COLUMN tournaments.registration_end_date IS 'End date for registration';
COMMENT ON COLUMN tournaments.event_start_time IS 'Start time of the event';
COMMENT ON COLUMN tournaments.event_end_time IS 'End time of the event';
COMMENT ON COLUMN tournaments.check_in_start_time IS 'Start time for check-in';
COMMENT ON COLUMN tournaments.check_in_end_time IS 'End time for check-in';
COMMENT ON COLUMN tournaments.contact_name IS 'Contact person name';
COMMENT ON COLUMN tournaments.contact_email IS 'Contact email address';
COMMENT ON COLUMN tournaments.contact_phone IS 'Contact phone number';
COMMENT ON COLUMN tournaments.address IS 'Main address of the venue';
COMMENT ON COLUMN tournaments.street IS 'Street name of the venue';
COMMENT ON COLUMN tournaments.city IS 'City where tournament is held';
COMMENT ON COLUMN tournaments.state IS 'State/province where tournament is held';
COMMENT ON COLUMN tournaments.country IS 'Country where tournament is held';
COMMENT ON COLUMN tournaments.pin_code IS 'Postal/zip code of the venue';
COMMENT ON COLUMN tournaments.sport IS 'Main sport of the tournament';
COMMENT ON COLUMN tournaments.format IS 'Format of the tournament';
COMMENT ON COLUMN tournaments.entry_fee IS 'Entry fee amount';
COMMENT ON COLUMN tournaments.team_limit IS 'Maximum number of teams allowed';
COMMENT ON COLUMN tournaments.teams_registered IS 'Number of teams registered';
COMMENT ON COLUMN tournaments.participants_registered IS 'Number of participants registered';
COMMENT ON COLUMN tournaments.creator_id IS 'ID of the user who created the tournament';
COMMENT ON COLUMN tournaments.user_id IS 'ID of the user associated with the tournament';
COMMENT ON COLUMN tournaments.banner_url IS 'URL of the tournament banner image';
COMMENT ON COLUMN tournaments.logo_url IS 'URL of the tournament logo image';
COMMENT ON COLUMN tournaments.image_url IS 'URL of the main tournament image';
COMMENT ON COLUMN tournaments.location IS 'Full location string combining address components';
COMMENT ON COLUMN tournaments.created_at IS 'Timestamp when the tournament was created';
COMMENT ON COLUMN tournaments.updated_at IS 'Timestamp when the tournament was last updated';

COMMENT ON COLUMN tournament_sports.sport IS 'Name of the sport';
COMMENT ON COLUMN tournament_sports.event_name IS 'Name of the event';
COMMENT ON COLUMN tournament_sports.format IS 'Format of the sport event';
COMMENT ON COLUMN tournament_sports.max_teams IS 'Maximum number of teams allowed';
COMMENT ON COLUMN tournament_sports.max_participants IS 'Maximum number of participants allowed';
COMMENT ON COLUMN tournament_sports.gender IS 'Gender category for the event';
COMMENT ON COLUMN tournament_sports.entry_fee IS 'Entry fee for this sport';
COMMENT ON COLUMN tournament_sports.play_type IS 'Type of play (e.g., Singles, Doubles)';
COMMENT ON COLUMN tournament_sports.additional_details IS 'Additional information about the sport';
COMMENT ON COLUMN tournament_sports.created_at IS 'Timestamp when the sport was added';
COMMENT ON COLUMN tournament_sports.updated_at IS 'Timestamp when the sport was last updated'; 