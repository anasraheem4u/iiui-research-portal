-- 1. Update Programs to English
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS department text DEFAULT 'English';

-- Update existing programs or insert if missing (simplistic update here)
UPDATE public.programs 
SET name = 'MS English', department = 'English' 
WHERE type = 'MS';

UPDATE public.programs 
SET name = 'PhD English', department = 'English' 
WHERE type = 'PhD';

-- 2. Clean up Batches (Remove Fall, ensure only Spring/Summer)
-- Optional: Comment this out if you want to keep old data
DELETE FROM public.batches WHERE name LIKE 'Fall%';

-- 3. Insert Spring/Summer batches for 2020-2030
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
