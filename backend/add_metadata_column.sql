-- Add document_metadata column to documents table
-- Run this SQL command in your Supabase SQL editor

ALTER TABLE documents ADD COLUMN document_metadata JSONB;

-- Add indexes for better query performance
CREATE INDEX idx_documents_metadata ON documents USING GIN (document_metadata);
CREATE INDEX idx_documents_risk_level ON documents USING GIN ((document_metadata->>'riskLevel'));
CREATE INDEX idx_documents_document_type ON documents USING GIN ((document_metadata->>'documentType'));

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'document_metadata';
