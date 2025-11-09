-- Create memes table schema for storing meme analysis results
-- This script creates the 'memes' table in your Supabase database
-- Run this in the Supabase SQL editor to set up the table

CREATE TABLE IF NOT EXISTS memes (
  -- Unique identifier for each meme record (auto-incrementing)
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- Title of the meme (text)
  title TEXT NOT NULL,
  
  -- Template name (e.g., "Drake Hotline Bling")
  template TEXT NOT NULL,
  
  -- Caption or description of the meme
  caption TEXT,
  
  -- AI-generated meaning or explanation
  meaning TEXT,
  
  -- Confidence score (0-100) of meme detection
  confidence INTEGER,
  
  -- Category of the meme (e.g., "Comparison/Choice", "Chaos/Argument")
  category TEXT,
  
  -- Timestamp when the record was created (automatically set to current time)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamp when the record was last updated
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for security
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read memes (public read access)
CREATE POLICY "Allow public read access on memes"
  ON memes FOR SELECT
  USING (true);

-- Create a policy to allow anyone to insert memes (for now, can be restricted later)
CREATE POLICY "Allow public insert on memes"
  ON memes FOR INSERT
  WITH CHECK (true);

-- Create an index on the created_at column for faster queries
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
