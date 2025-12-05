-- Migration: Fix foreign key constraint to allow cascade delete
-- This allows deleting users from auth.users without constraint violations
-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Step 2: Re-add the foreign key with ON DELETE CASCADE
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;

-- Step 3: Also fix contributions table to cascade delete when user_profiles are deleted
ALTER TABLE public.contributions
DROP CONSTRAINT IF EXISTS contributions_contributor_id_fkey;

ALTER TABLE public.contributions ADD CONSTRAINT contributions_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.user_profiles (id) ON DELETE SET NULL;

ALTER TABLE public.contributions
DROP CONSTRAINT IF EXISTS contributions_reviewer_id_fkey;

ALTER TABLE public.contributions ADD CONSTRAINT contributions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.user_profiles (id) ON DELETE SET NULL;

-- Explanation:
-- - user_profiles.id -> auth.users.id: ON DELETE CASCADE
--   When a user is deleted from auth, their profile is automatically deleted
-- 
-- - contributions.contributor_id/reviewer_id -> user_profiles.id: ON DELETE SET NULL
--   When a user profile is deleted, their contributions remain but the user reference is set to NULL
--   This preserves contribution history even if the user account is deleted