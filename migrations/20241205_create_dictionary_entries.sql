-- Migration: create_dictionary_entries_table
-- Run this in Supabase SQL Editor
-- Create dictionary_entries table for admin-managed dictionary entries
CREATE TABLE
      public.dictionary_entries (
            id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
            word text NOT NULL CHECK (char_length(word) > 0),
            translation text NOT NULL CHECK (char_length(translation) > 0),
            phonetic text,
            language text DEFAULT 'nung' CHECK (language IN ('nung', 'central')),
            example text,
            notes text,
            status text DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
            created_by uuid REFERENCES auth.users (id),
            created_at timestamptz DEFAULT now (),
            updated_at timestamptz DEFAULT now ()
      );

-- Enable RLS
ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved entries
CREATE POLICY "Anyone can read approved entries" ON public.dictionary_entries FOR
SELECT
      USING (
            status = 'approved'
            OR auth.uid () IS NOT NULL
      );

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert entries" ON public.dictionary_entries FOR INSERT
WITH
      CHECK (auth.uid () IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update entries" ON public.dictionary_entries FOR
UPDATE USING (auth.uid () IS NOT NULL)
WITH
      CHECK (auth.uid () IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete entries" ON public.dictionary_entries FOR DELETE USING (auth.uid () IS NOT NULL);

-- Create indexes for faster lookups
CREATE INDEX idx_dictionary_entries_word ON public.dictionary_entries (word);

CREATE INDEX idx_dictionary_entries_status ON public.dictionary_entries (status);

CREATE INDEX idx_dictionary_entries_language ON public.dictionary_entries (language);