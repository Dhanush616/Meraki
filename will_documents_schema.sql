-- ══════════════════════════════════════════════════════════════════════════════
-- Will Documents — ADDITIVE MIGRATION
--
-- The `will_documents` table and its RLS policies already exist in schema.sql.
-- This migration ONLY adds the 3 columns that the FastAPI will router uses
-- but were not in the original schema.
--
-- Safe to run even if already applied (uses IF NOT EXISTS / DO NOTHING guards).
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add missing columns to will_documents ─────────────────────────────────
--
-- executor_name        → stored at generation time; shown in PDF & UI
-- special_instructions → stored at generation time; shown in PDF & UI
-- trigger_event        → why this version was created (audit trail)
--
-- All three use ADD COLUMN IF NOT EXISTS so re-running is safe.

ALTER TABLE public.will_documents
    ADD COLUMN IF NOT EXISTS executor_name        TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS special_instructions TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS trigger_event        TEXT;

-- ── 2. Storage bucket: 'generated-documents' ─────────────────────────────────
--
-- The schema.sql comments describe this bucket but do not create it via SQL.
-- This INSERT is idempotent (ON CONFLICT DO NOTHING).

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-documents', 'generated-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Storage RLS policies ───────────────────────────────────────────────────
--
-- The FastAPI backend uses the SERVICE ROLE KEY, which bypasses RLS entirely.
-- These policies are only needed if you ever access storage directly from the
-- frontend/client (e.g., to display signed URLs).
--
-- Files are stored as: {user_id}/will_v{n}_{hash}.pdf
-- so we scope each policy to the user's own folder.

-- Allow authenticated users to read files in their own folder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'Users can read their own generated documents'
    ) THEN
        CREATE POLICY "Users can read their own generated documents"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'generated-documents'
                AND auth.uid()::text = (string_to_array(name, '/'))[1]
            );
    END IF;
END $$;

-- Allow authenticated users to upload files to their own folder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'Users can upload their own generated documents'
    ) THEN
        CREATE POLICY "Users can upload their own generated documents"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'generated-documents'
                AND auth.uid()::text = (string_to_array(name, '/'))[1]
            );
    END IF;
END $$;

-- Allow authenticated users to delete files in their own folder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename  = 'objects'
          AND policyname = 'Users can delete their own generated documents'
    ) THEN
        CREATE POLICY "Users can delete their own generated documents"
            ON storage.objects FOR DELETE
            USING (
                bucket_id = 'generated-documents'
                AND auth.uid()::text = (string_to_array(name, '/'))[1]
            );
    END IF;
END $$;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Verify with:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'will_documents'
--   ORDER BY ordinal_position;
