# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `medical-simplifier` (or your choice)
   - Database Password: Choose a strong password
   - Region: Choose the closest region
5. Click "Create new project"

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 3. Set Up Environment Variables

Create a `.env` file in the root of your project:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:**

- The `.env` file is already in `.gitignore`, so it won't be committed
- Restart your React dev server after adding the `.env` file

## 4. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase_setup.sql`
4. Click "Run" to execute the SQL

This will create:

- `searches` table for storing search history
- Row Level Security (RLS) policies
- Indexes for better performance

## 5. Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (usually enabled by default)
3. Configure email templates if needed (optional)
4. Set up email confirmation settings:
   - Go to **Authentication** → **Settings**
   - Configure "Enable email confirmations" based on your needs

## 6. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` which is already added to `package.json`.

## 7. Test the Setup

1. Start your React app: `npm start`
2. Try signing up with a new account
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Sign in and test the search functionality
5. Check your Supabase dashboard → **Table Editor** → **searches** to see saved searches

## Features Enabled

### Authentication

- ✅ User sign up with email/password
- ✅ User sign in
- ✅ User logout
- ✅ Session management
- ✅ Protected routes

### Search Functionality

- ✅ Save searches to Supabase
- ✅ View search history
- ✅ Use previous searches
- ✅ Search history is private (users only see their own)

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure you created a `.env` file in the root directory
- Check that the variable names start with `REACT_APP_`
- Restart your React dev server after adding environment variables

### Authentication errors

- Check that email provider is enabled in Supabase
- Verify your Supabase URL and anon key are correct
- Check browser console for detailed error messages

### Database errors

- Make sure you ran the SQL setup script
- Check that Row Level Security (RLS) policies are created
- Verify the `searches` table exists in your Supabase database

### Search history not saving

- Check that the user is logged in
- Verify the `searches` table exists
- Check browser console for errors
- Verify RLS policies allow INSERT for authenticated users

## Dictionary Setup

After setting up authentication and searches, you can populate the medical dictionary:

1. **Run the SQL setup** (already included in `supabase_setup.sql`)
2. **Populate dictionary** with medical terms:

   - Use the Supabase Table Editor to insert terms manually
   - Or import from CSV
   - See `DICTIONARY_SETUP.md` for detailed instructions

3. **Test dictionary search**:
   - Use the search bar in the navbar
   - Toggle between "Dictionary" and "AI" modes
   - Search for medical terms

## Next Steps

- Populate the medical dictionary (see `DICTIONARY_SETUP.md`)
- Customize email templates in Supabase
- Add more user profile fields if needed
- Set up database backups
- Configure custom domain (optional)
- Add more search filters or sorting options
