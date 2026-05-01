DO $$
BEGIN
    IF to_regclass('public.users') IS NOT NULL THEN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count integer;
        UPDATE users SET streak_count = 0 WHERE streak_count IS NULL;
        ALTER TABLE users ALTER COLUMN streak_count SET DEFAULT 0;
        ALTER TABLE users ALTER COLUMN streak_count SET NOT NULL;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_played_date date;
    END IF;
END $$;
