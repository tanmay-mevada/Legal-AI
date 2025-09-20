-- Add document_metadata column to documents table
-- Run this SQL command in your Supabase SQL editor or database

ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_metadata JSONB;

-- Add index for better query performance on document_metadata
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING GIN (document_metadata);

-- Add index for risk level queries
CREATE INDEX IF NOT EXISTS idx_documents_risk_level ON documents USING GIN ((document_metadata->>'riskLevel'));

-- Add index for document type queries  
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents USING GIN ((document_metadata->>'documentType'));

-- Example of how the document_metadata will look:
-- {
--   "documentType": "Contract",
--   "complexity": "Moderate", 
--   "riskLevel": "Medium",
--   "riskFactors": ["Unclear termination clauses", "Payment terms lack specificity"],
--   "keyParties": ["ABC Corporation", "XYZ Services LLC"],
--   "wordCount": 1250,
--   "pageCount": 3
-- }
