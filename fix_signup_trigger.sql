-- ====================================================
-- Fix: handle_new_user Trigger
-- Run this in your Supabase SQL Editor
-- ====================================================

-- Step 1: Drop the existing trigger and function if they exist (safe re-create)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Recreate the function to correctly handle all fields sent from the registration form
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    registration_number,
    role,
    program_id,
    batch_id,
    department,
    coordinator_id,
    status,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'registration_number', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'program_id' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'program_id' != '' 
      THEN (NEW.raw_user_meta_data->>'program_id')::uuid
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'batch_id' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'batch_id' != '' 
      THEN (NEW.raw_user_meta_data->>'batch_id')::uuid
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'department', 'English'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'coordinator_id' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'coordinator_id' != '' 
      THEN (NEW.raw_user_meta_data->>'coordinator_id')::uuid
      ELSE NULL
    END,
    -- New students always start as 'pending' — coordinator must approve them
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN 'pending'
      ELSE 'approved'
    END,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger that calls this function after a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Make sure the get_coordinators RPC function exists
CREATE OR REPLACE FUNCTION public.get_coordinators()
RETURNS TABLE (id uuid, full_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, full_name FROM public.users WHERE role = 'coordinator' ORDER BY full_name;
$$;

-- Done!
-- After running this script:
-- 1. New user registrations will correctly populate the public.users table.
-- 2. The get_coordinators() function will return available coordinators.
