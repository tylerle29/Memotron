-- Update memes table to include image storage fields
-- Add this to your Supabase SQL editor

ALTER TABLE memes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE memes ADD COLUMN IF NOT EXISTS user_prompt TEXT;
ALTER TABLE memes ADD COLUMN IF NOT EXISTS detected_persons JSONB;

-- Create index on image_url for faster queries
CREATE INDEX IF NOT EXISTS idx_memes_image_url ON memes(image_url);
