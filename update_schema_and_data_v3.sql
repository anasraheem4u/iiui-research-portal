DO $$
DECLARE 
    fallback_batch_id uuid;
BEGIN
    -- 1. Create Default Batch (Spring 2024) if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.batches WHERE name = 'Spring 2024') THEN
        INSERT INTO public.batches (name, start_date)
        VALUES ('Spring 2024', '2024-02-01')
        RETURNING id INTO fallback_batch_id;
    ELSE
        SELECT id INTO fallback_batch_id FROM public.batches WHERE name = 'Spring 2024' LIMIT 1;
    END IF;

    -- 2. Prevent FK Violation: Move users from batches we plan to delete
    UPDATE public.users 
    SET batch_id = fallback_batch_id
    WHERE batch_id IN (SELECT id FROM public.batches WHERE name LIKE 'Fall%');

    -- NOW safe to delete 'Fall' batches
    DELETE FROM public.batches WHERE name LIKE 'Fall%';

    -- 3. Update Programs to English
    -- Add column if missing (safe idempotent check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='programs' AND column_name='department') THEN
        ALTER TABLE public.programs ADD COLUMN department text DEFAULT 'English';
    END IF;

    UPDATE public.programs 
    SET name = 'MS English', department = 'English' 
    WHERE type = 'MS';

    UPDATE public.programs 
    SET name = 'PhD English', department = 'English' 
    WHERE type = 'PhD';

END $$;

-- 4. Populate Spring/Summer Batches (2020-2030)
INSERT INTO public.batches (name, start_date)
SELECT 
  'Spring ' || year, 
  (year || '-02-01')::date
FROM generate_series(2020, 2030) AS year
WHERE NOT EXISTS (
  SELECT 1 FROM public.batches WHERE name = 'Spring ' || year
);

INSERT INTO public.batches (name, start_date)
SELECT 
  'Summer ' || year, 
  (year || '-06-01')::date
FROM generate_series(2020, 2030) AS year
WHERE NOT EXISTS (
  SELECT 1 FROM public.batches WHERE name = 'Summer ' || year
);
