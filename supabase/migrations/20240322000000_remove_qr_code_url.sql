-- Remove qr_code_url column from tournaments if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments'
    AND column_name = 'qr_code_url'
  ) THEN
    ALTER TABLE tournaments DROP COLUMN qr_code_url;
  END IF;
END
$$; 