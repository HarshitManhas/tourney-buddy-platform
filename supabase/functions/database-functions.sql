
-- Function to get received messages with sender and tournament information
CREATE OR REPLACE FUNCTION public.get_received_messages(user_id UUID)
RETURNS SETOF json AS $$
  SELECT 
    json_build_object(
      'id', pm.id,
      'sender_id', pm.sender_id,
      'sender_name', p.username,
      'recipient_id', pm.recipient_id,
      'tournament_id', pm.tournament_id,
      'tournament_name', t.tournament_name,
      'message', pm.message,
      'created_at', pm.created_at,
      'read', pm.read
    )
  FROM private_messages pm
  JOIN profiles p ON pm.sender_id = p.id
  JOIN tournaments t ON pm.tournament_id = t.id
  WHERE pm.recipient_id = user_id
  ORDER BY pm.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get sent messages with recipient and tournament information
CREATE OR REPLACE FUNCTION public.get_sent_messages(user_id UUID)
RETURNS SETOF json AS $$
  SELECT 
    json_build_object(
      'id', pm.id,
      'sender_id', pm.sender_id,
      'recipient_id', pm.recipient_id,
      'recipient_name', p.username,
      'tournament_id', pm.tournament_id,
      'tournament_name', t.tournament_name,
      'message', pm.message,
      'created_at', pm.created_at,
      'read', pm.read
    )
  FROM private_messages pm
  JOIN profiles p ON pm.recipient_id = p.id
  JOIN tournaments t ON pm.tournament_id = t.id
  WHERE pm.sender_id = user_id
  ORDER BY pm.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to mark a message as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id UUID, current_user_id UUID)
RETURNS boolean AS $$
DECLARE
  success boolean;
BEGIN
  UPDATE private_messages
  SET read = true
  WHERE id = message_id AND recipient_id = current_user_id;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a private message
CREATE OR REPLACE FUNCTION public.send_private_message(
  sender_id UUID,
  recipient_id UUID,
  tournament_id UUID,
  message_text TEXT
)
RETURNS UUID AS $$
DECLARE
  new_message_id UUID;
BEGIN
  INSERT INTO private_messages (sender_id, recipient_id, tournament_id, message)
  VALUES (sender_id, recipient_id, tournament_id, message_text)
  RETURNING id INTO new_message_id;
  
  RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available tournaments for a user to message
CREATE OR REPLACE FUNCTION public.get_user_tournaments(user_id UUID)
RETURNS SETOF json AS $$
  WITH user_tournaments AS (
    -- Tournaments the user has participated in
    SELECT t.id, t.tournament_name, t.creator_id
    FROM tournaments t
    JOIN tournament_participants tp ON t.id = tp.tournament_id
    WHERE tp.user_id = user_id
    
    UNION
    
    -- Tournaments the user has created
    SELECT id, tournament_name, creator_id
    FROM tournaments
    WHERE creator_id = user_id
  )
  SELECT 
    json_build_object(
      'id', ut.id,
      'tournament_name', ut.tournament_name,
      'creator_id', ut.creator_id,
      'creator_name', p.username
    )
  FROM user_tournaments ut
  JOIN profiles p ON ut.creator_id = p.id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get tournament announcements with sender info
CREATE OR REPLACE FUNCTION public.get_tournament_announcements(tournament_id UUID)
RETURNS SETOF json AS $$
  SELECT 
    json_build_object(
      'id', ta.id,
      'tournament_id', ta.tournament_id,
      'sender_id', ta.sender_id,
      'sender_name', p.username,
      'title', ta.title,
      'message', ta.message,
      'created_at', ta.created_at
    )
  FROM tournament_announcements ta
  JOIN profiles p ON ta.sender_id = p.id
  WHERE ta.tournament_id = tournament_id
  ORDER BY ta.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to create a tournament announcement
CREATE OR REPLACE FUNCTION public.create_tournament_announcement(
  tournament_id UUID,
  sender_id UUID,
  title TEXT,
  message_text TEXT
)
RETURNS UUID AS $$
DECLARE
  new_announcement_id UUID;
BEGIN
  INSERT INTO tournament_announcements (tournament_id, sender_id, title, message)
  VALUES (tournament_id, sender_id, title, message_text)
  RETURNING id INTO new_announcement_id;
  
  RETURN new_announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add participants_registered column to tournaments if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments'
    AND column_name = 'participants_registered'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN participants_registered integer DEFAULT 0;
  END IF;
END
$$;

-- Ensure we have a profile-images bucket in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'Profile Images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to profile images
INSERT INTO storage.policies (name, definition, owner, bucket_id, policy)
SELECT 
  'Public Read Access for Profile Images',
  'storage.buckets.name = ''profile-images''',
  (SELECT uuid FROM auth.users LIMIT 1),
  'profile-images',
  '(bucket_id = ''profile-images''::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE name = 'Public Read Access for Profile Images' AND bucket_id = 'profile-images'
);

-- Create policy to allow authenticated users to upload profile images
INSERT INTO storage.policies (name, definition, owner, bucket_id, policy)
SELECT 
  'Authenticated Users Can Upload Profile Images',
  'storage.buckets.name = ''profile-images'' AND auth.role() = ''authenticated''',
  (SELECT uuid FROM auth.users LIMIT 1),
  'profile-images',
  '(bucket_id = ''profile-images''::text AND auth.role() = ''authenticated''::text)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE name = 'Authenticated Users Can Upload Profile Images' AND bucket_id = 'profile-images'
);

