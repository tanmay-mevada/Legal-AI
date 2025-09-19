-- Create user_activity table for tracking user login activity
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    login_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_login ON user_activity(last_login);

-- Enable Row Level Security (RLS)
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own activity
CREATE POLICY "Users can view own activity" ON user_activity
    FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy to allow users to update their own activity
CREATE POLICY "Users can update own activity" ON user_activity
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own activity
CREATE POLICY "Users can insert own activity" ON user_activity
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy for admin access (you may need to adjust this based on your admin setup)
-- This allows service role to access all records
CREATE POLICY "Service role can access all activity" ON user_activity
    FOR ALL USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_activity_updated_at 
    BEFORE UPDATE ON user_activity 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create documents table for storing document metadata and processing results
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    bucket_path TEXT NOT NULL,
    content_type TEXT,
    size_bytes INTEGER,
    pages INTEGER,
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
    extracted_text TEXT,
    summary TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Enable Row Level Security (RLS) for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can access all documents" ON documents
    FOR ALL USING (true);

-- Create trigger to automatically update updated_at for documents
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();