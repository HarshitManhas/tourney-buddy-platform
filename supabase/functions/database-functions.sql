
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

-- Function to get join requests for a tournament
CREATE OR REPLACE FUNCTION public.get_tournament_join_requests(tournament_id UUID)
RETURNS SETOF json AS $$
  SELECT 
    json_build_object(
      'id', tjr.id,
      'tournament_id', tjr.tournament_id,
      'user_id', tjr.user_id,
      'player_name', tjr.player_name,
      'gender', tjr.gender,
      'mobile_no', tjr.mobile_no,
      'roles', tjr.roles,
      'partner_name', tjr.partner_name,
      'partner_gender', tjr.partner_gender,
      'partner_mobile_no', tjr.partner_mobile_no,
      'additional_info', tjr.additional_info,
      'payment_proof_url', tjr.payment_proof_url,
      'status', tjr.status,
      'submitted_at', tjr.submitted_at,
      'reviewed_at', tjr.reviewed_at,
      'reviewer_notes', tjr.reviewer_notes
    )
  FROM tournament_join_requests tjr
  WHERE tjr.tournament_id = tournament_id
  ORDER BY tjr.submitted_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a function to handle creating storage bucket policies
CREATE OR REPLACE FUNCTION public.create_storage_policy(bucket_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create policy to allow users to read from the bucket
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition) 
    VALUES (
      bucket_name || '_read_policy',
      bucket_name,
      'SELECT',
      '(bucket_id = ''' || bucket_name || '''::text)'
    );
  EXCEPTION 
    WHEN unique_violation THEN
      NULL; -- Policy already exists, ignore
  END;
  
  -- Create policy to allow authenticated users to insert
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition) 
    VALUES (
      bucket_name || '_insert_policy',
      bucket_name,
      'INSERT',
      '(bucket_id = ''' || bucket_name || '''::text AND auth.role() = ''authenticated'')'
    );
  EXCEPTION 
    WHEN unique_violation THEN
      NULL; -- Policy already exists, ignore
  END;
  
  -- Create policy to allow authenticated users to update their own files
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition) 
    VALUES (
      bucket_name || '_update_policy',
      bucket_name,
      'UPDATE',
      '(bucket_id = ''' || bucket_name || '''::text AND auth.role() = ''authenticated'' AND (storage.foldername(name))[1] = auth.uid()::text)'
    );
  EXCEPTION 
    WHEN unique_violation THEN
      NULL; -- Policy already exists, ignore
  END;
  
  -- Create policy to allow authenticated users to delete their own files
  BEGIN
    INSERT INTO storage.policies (name, bucket_id, operation, definition) 
    VALUES (
      bucket_name || '_delete_policy',
      bucket_name,
      'DELETE',
      '(bucket_id = ''' || bucket_name || '''::text AND auth.role() = ''authenticated'' AND (storage.foldername(name))[1] = auth.uid()::text)'
    );
  EXCEPTION 
    WHEN unique_violation THEN
      NULL; -- Policy already exists, ignore
  END;
END;
$$;
