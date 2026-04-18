-- Run this in your Supabase SQL Editor to create the necessary tables for the Assets module

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    institution_name TEXT,
    account_identifier TEXT,
    estimated_value_inr NUMERIC,
    nominee_registered BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    primary_total_pct NUMERIC DEFAULT 100,
    primary_beneficiary_count INTEGER DEFAULT 1,
    backup_beneficiary_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow users to only see and create their own assets
CREATE POLICY "Users can insert their own assets" ON public.assets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own assets" ON public.assets
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own assets" ON public.assets
    FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own assets" ON public.assets
    FOR DELETE USING (auth.uid() = owner_id);
    
-- Add simple trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
