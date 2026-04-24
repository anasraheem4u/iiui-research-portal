-- Run this securely in the Supabase SQL Editor to replace Summer batches with Fall
DO $$
DECLARE 
    fallback_batch_id uuid;
BEGIN
    -- 1. Create Default Fall Batch (Fall 2024) if it doesn't exist to safely migrate Summer users
    IF NOT EXISTS (SELECT 1 FROM public.batches WHERE name = 'Fall 2024') THEN
        INSERT INTO public.batches (name, start_date)
        VALUES ('Fall 2024', '2024-09-01')
        RETURNING id INTO fallback_batch_id;
    ELSE
        SELECT id INTO fallback_batch_id FROM public.batches WHERE name = 'Fall 2024' LIMIT 1;
    END IF;

    -- 2. Prevent FK Violation: Move users from Summer batches we plan to delete
    UPDATE public.users 
    SET batch_id = fallback_batch_id
    WHERE batch_id IN (SELECT id FROM public.batches WHERE name LIKE 'Summer%');

    -- NOW safe to delete 'Summer' batches
    DELETE FROM public.batches WHERE name LIKE 'Summer%';

END $$;

-- 3. Populate Fall Batches (2020-2030)
INSERT INTO public.batches (name, start_date)
SELECT 
  'Fall ' || year, 
  (year || '-09-01')::date
FROM generate_series(2020, 2030) AS year
WHERE NOT EXISTS (
  SELECT 1 FROM public.batches WHERE name = 'Fall ' || year
);
