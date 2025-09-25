-- Migration: Add unique_file_key column to documents table
-- This enables smart duplicate detection per user
-- Run this in your Supabase SQL Editor

-- Step 1: Add the unique_file_key column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS unique_file_key TEXT;

-- Step 2: Update existing records to populate unique_file_key
-- Format: user_id:file_name (allows same filename per user)
UPDATE documents 
SET unique_file_key = user_id || ':' || file_name 
WHERE unique_file_key IS NULL;

-- Step 3: Create a unique index on unique_file_key to prevent duplicates
-- (Only after all existing records are updated)
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_unique_file_key ON documents(unique_file_key);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN documents.unique_file_key IS 'Unique key combining user_id and file_name to allow duplicate filenames per user while preventing duplicates within same user';

-- Verification query - run this to check the migration worked
-- SELECT id, user_id, file_name, unique_file_key FROM documents LIMIT 5;