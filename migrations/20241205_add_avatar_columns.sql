-- Migration: Add avatar_url and email_verified columns to user_profiles
-- Run this in Supabase SQL Editor
-- Add avatar_url column
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add email_verified column  
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create storage bucket for avatars (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- Create admin account (after running migration, create user in Auth dashboard with):
-- Email: admin@nungdic.vn
-- Password: $econdnot2@
-- Then update the profile:
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'admin@nungdic.vn';