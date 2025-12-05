-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contributions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  word text NOT NULL CHECK (char_length(word) > 0),
  translation text NOT NULL CHECK (char_length(translation) > 0),
  source_lang text NOT NULL,
  target_lang text NOT NULL,
  phonetic text,
  region text,
  example text,
  meaning text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  reject_reason text,
  contributor_id uuid,
  reviewer_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  CONSTRAINT contributions_pkey PRIMARY KEY (id),
  CONSTRAINT contributions_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.user_profiles(id),
  CONSTRAINT contributions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text,
  display_name text,
  role text DEFAULT 'contributor'::text CHECK (role = ANY (ARRAY['contributor'::text, 'admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);