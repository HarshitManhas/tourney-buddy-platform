-- Add qr_code_url column to tournaments if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments'
    AND column_name = 'qr_code_url'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN qr_code_url text;
  END IF;
END
$$; 