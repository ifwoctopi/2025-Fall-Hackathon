# Quick Supabase Setup Guide

## Step 1: Create Supabase Account & Project (5 minutes)

1. **Go to Supabase**: Open https://supabase.com in your browser
2. **Sign Up/Login**: 
   - Click "Start your project" or "Sign in"
   - You can sign up with GitHub, Google, or email
3. **Create New Project**:
   - Click "New Project" button
   - Fill in:
     - **Name**: `medical-simplifier` (or any name you like)
     - **Database Password**: Create a strong password (save it somewhere safe!)
     - **Region**: Choose the closest region to you
   - Click "Create new project"
   - Wait 2-3 minutes for the project to be created

## Step 2: Get Your Credentials (2 minutes)

1. In your Supabase dashboard, click **Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Update Your .env File

Once you have the credentials, I'll help you add them to your `.env` file.

## Step 4: Set Up Database Tables

1. In Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase_setup.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 5: Configure Authentication

1. Click **Authentication** → **Providers** in left sidebar
2. Make sure **Email** provider is enabled (should be by default)
3. (Optional) Go to **Authentication** → **Settings**:
   - You can disable "Enable email confirmations" for testing
   - Or leave it enabled for production use

## Step 6: Restart Your React App

After updating `.env`, restart your React dev server:
- Stop the current server (Ctrl+C)
- Run `npm start` again

## That's it! 🎉

Your app should now have full authentication and search history features.

