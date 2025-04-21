-- Add address-related columns to tournaments table
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- Update existing tournaments to set default values for new columns
UPDATE tournaments
SET 
    address = COALESCE(address, ''),
    street = COALESCE(street, ''),
    city = COALESCE(city, ''),
    state = COALESCE(state, ''),
    country = COALESCE(country, ''),
    pin_code = COALESCE(pin_code, '')
WHERE 
    address IS NULL OR
    street IS NULL OR
    city IS NULL OR
    state IS NULL OR
    country IS NULL OR
    pin_code IS NULL;

-- Add comments to the columns
COMMENT ON COLUMN tournaments.address IS 'The main address of the tournament venue';
COMMENT ON COLUMN tournaments.street IS 'The street name of the tournament venue';
COMMENT ON COLUMN tournaments.city IS 'The city where the tournament is held';
COMMENT ON COLUMN tournaments.state IS 'The state/province where the tournament is held';
COMMENT ON COLUMN tournaments.country IS 'The country where the tournament is held';
COMMENT ON COLUMN tournaments.pin_code IS 'The postal/zip code of the tournament venue'; 