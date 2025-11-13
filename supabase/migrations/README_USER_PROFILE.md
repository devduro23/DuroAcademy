# User Profile Migration

This migration adds profile-related fields to the `users` table to support the ProfileScreen functionality.

## Fields Added

### Personal Information
- `full_name` - User's full name
- `avatar_url` - URL to profile picture
- `email` - User email (should already exist)
- `phone` - Phone number (optional)

### Work Information
- `employee_id` - Company employee ID
- `department` - User's department or team
- `role` - User role (default: 'user')

### Statistics
- `modules_completed` - Number of completed learning modules
- `hours_watched` - Total hours of video content watched
- `quizzes_taken` - Number of quizzes completed

### Timestamps
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the content of `add_user_profile_fields.sql`
5. Click **Run**

### Option 2: Supabase CLI
```bash
cd supabase
supabase db push
```

## Testing

After running the migration, you can test with:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Insert test data
UPDATE users 
SET 
  full_name = 'John Doe',
  employee_id = 'EMP-2024-001',
  department = 'Engineering',
  modules_completed = 5,
  hours_watched = 12.5,
  quizzes_taken = 10
WHERE email = 'your-email@example.com';
```

## Row Level Security (RLS)

Make sure RLS policies allow users to:
- Read their own profile data
- Update their own profile data

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

## ProfileScreen Integration

The ProfileScreen now fetches data from these columns:
- Displays `full_name` as the main name
- Shows `avatar_url` if available (falls back to initials)
- Displays `employee_id` and `department`
- Shows statistics: `modules_completed`, `hours_watched`, `quizzes_taken`
- Pull-to-refresh to reload data

## Future Enhancements

Potential additions:
- `bio` - User biography
- `location` - User location
- `joined_date` - First day at company
- `achievements` - JSON array of earned achievements
- `preferences` - JSON object for app preferences
