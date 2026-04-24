-- 1. Create a default "Spring 2024" batch to map users to if their current batch is deleted
DO $$
DECLARE 
    fallback_batch_id uuid;
BEGIN
    -- Create "Spring 2024" if not exists and get its ID
    INSERT INTO public.batches (name, start_date)
    VALUES ('Spring 2024', '2024-02-01')
    ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO fallback_batch_id FROM public.batches WHERE name = 'Spring 2024' LIMIT 1;

    -- Update users linked to "Fall" batches to use the fallback batch
    -- This prevents foreign key violation when we delete the old batches
    UPDATE public.users 
    SET batch_id = fallback_batch_id
    WHERE batch_id IN (SELECT id FROM public.batches WHERE name LIKE 'Fall%');
END $$;

-- 2. Update Programs to English
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS department text DEFAULT 'English';

UPDATE public.programs 
SET name = 'MS English', department = 'English' 
WHERE type = 'MS';

UPDATE public.programs 
SET name = 'PhD English', department = 'English' 
WHERE type = 'PhD';

-- 3. Clean up Batches (Remove Fall, ensure only Spring/Summer)
-- Now safe to delete because no users reference these batches
DELETE FROM public.batches WHERE name LIKE 'Fall%';

-- 4. Insert Spring/Summer batches for 2020-2030
-- Create constraint on name to avoid duplicates if not already present
-- (This is just in case, typically 'name' should be unique but schema ddl context wasn't full)

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
