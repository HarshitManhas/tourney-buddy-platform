-- Update tournament_join_requests table
ALTER TABLE tournament_join_requests 
DROP COLUMN IF EXISTS roles,
DROP COLUMN IF EXISTS partner_name,
DROP COLUMN IF EXISTS partner_gender,
DROP COLUMN IF EXISTS partner_mobile_no;

-- Create new columns for all types of sports
ALTER TABLE tournament_join_requests 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS auction_details JSONB, -- For auction-based sports (cricket, football, etc.)
ADD COLUMN IF NOT EXISTS partner_details JSONB, -- For doubles/mixed sports
ADD COLUMN IF NOT EXISTS player_roles TEXT[], -- For specific sport roles
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD CONSTRAINT unique_user_sport_tournament UNIQUE (user_id, tournament_id, sport);

-- Create function to check if user can join sport
CREATE OR REPLACE FUNCTION check_user_sport_eligibility(
  p_user_id UUID,
  p_tournament_id UUID,
  p_sport TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  existing_request RECORD;
BEGIN
  -- Check if user has an accepted request for this sport
  SELECT * INTO existing_request
  FROM tournament_join_requests
  WHERE user_id = p_user_id
    AND tournament_id = p_tournament_id
    AND sport = p_sport
    AND status = 'accepted'
    AND rejected_at IS NULL;
    
  -- If found an accepted request, return false (cannot join)
  IF FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If no accepted request found, they can join
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 