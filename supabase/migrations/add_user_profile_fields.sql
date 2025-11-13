-- Add profile fields to users table if they don't exist

-- Add full_name column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add avatar_url column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add employee_id column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- Add department column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Add stats columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS modules_completed INTEGER DEFAULT 0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hours_watched DECIMAL(10, 2) DEFAULT 0.0;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS quizzes_taken INTEGER DEFAULT 0;

-- Add phone column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add role column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add created_at if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index on employee_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

COMMENT ON COLUMN users.full_name IS 'User full name';
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN users.employee_id IS 'Company employee ID';
COMMENT ON COLUMN users.department IS 'User department or team';
COMMENT ON COLUMN users.modules_completed IS 'Number of completed modules';
COMMENT ON COLUMN users.hours_watched IS 'Total hours of video watched';
COMMENT ON COLUMN users.quizzes_taken IS 'Number of quizzes taken';
