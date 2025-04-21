-- Insert test data for singles
INSERT INTO public.tournament_registrations 
(tournament_id, player_name, sport, status)
SELECT 
    t.id,
    'Player ' || i,
    s.sport,
    'approved'
FROM 
    tournaments t
    CROSS JOIN (SELECT generate_series(1, 5) AS i) numbers
    CROSS JOIN (
        SELECT DISTINCT sport 
        FROM tournaments_sports 
        WHERE format = 'singles'
        LIMIT 1
    ) s;

-- Insert test data for doubles
INSERT INTO public.tournament_registrations 
(tournament_id, player_name, partner_name, sport, status)
SELECT 
    t.id,
    'Player ' || (i*2-1),
    'Player ' || (i*2),
    s.sport,
    'approved'
FROM 
    tournaments t
    CROSS JOIN (SELECT generate_series(1, 3) AS i) numbers
    CROSS JOIN (
        SELECT DISTINCT sport 
        FROM tournaments_sports 
        WHERE format IN ('doubles', 'mixed')
        LIMIT 1
    ) s; 