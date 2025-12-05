-- Migration: Fix RLS policies for contributions table
-- Run this in Supabase SQL Editor
-- Enable RLS on contributions table (if not already enabled)
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all contributions" ON public.contributions;

DROP POLICY IF EXISTS "Users can insert own contributions" ON public.contributions;

DROP POLICY IF EXISTS "Users can update own contributions" ON public.contributions;

DROP POLICY IF EXISTS "Admins can do anything" ON public.contributions;

-- Allow all authenticated users to view contributions
CREATE POLICY "Users can view all contributions" ON public.contributions FOR
SELECT
      USING (true);

-- Allow authenticated users to insert their own contributions
CREATE POLICY "Users can insert contributions" ON public.contributions FOR INSERT
WITH
      CHECK (auth.uid () IS NOT NULL);

-- Allow users to update their own pending contributions
CREATE POLICY "Users can update own pending contributions" ON public.contributions FOR
UPDATE USING (
      contributor_id = auth.uid ()
      AND status = 'pending'
);

-- Allow admins to update any contribution (for approval/rejection)
CREATE POLICY "Admins can update any contribution" ON public.contributions FOR
UPDATE USING (
      EXISTS (
            SELECT
                  1
            FROM
                  public.user_profiles
            WHERE
                  id = auth.uid ()
                  AND role = 'admin'
      )
);

-- Allow admins to delete contributions
CREATE POLICY "Admins can delete contributions" ON public.contributions FOR DELETE USING (
      EXISTS (
            SELECT
                  1
            FROM
                  public.user_profiles
            WHERE
                  id = auth.uid ()
                  AND role = 'admin'
      )
);