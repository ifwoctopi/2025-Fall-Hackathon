# Fix Authentication Issues

## Problem: "Invalid login credentials" or email confirmation issues

## Solution 1: Disable Email Confirmation (Recommended for Testing)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dbdehvyivpdmiinkpzas
2. Click **Authentication** in the left sidebar
3. Click **Settings** (under Authentication)
4. Scroll down to **Email Auth** section
5. **Uncheck** "Enable email confirmations"
6. Click **Save**

Now you can sign up and immediately sign in without email confirmation.

## Solution 2: Use the Confirmation Link

If you want to keep email confirmation enabled:
1. Check your email inbox (and spam folder)
2. Look for an email from Supabase
3. Click the confirmation link
4. Then try signing in again

## Solution 3: Reset Password

If you're having trouble:
1. Go to Supabase dashboard → **Authentication** → **Users**
2. Find your user email
3. Click the three dots (⋯) next to the user
4. Click "Reset password" or "Send magic link"

## Solution 4: Delete and Recreate Account

1. Go to Supabase dashboard → **Authentication** → **Users**
2. Find your user and delete it
3. Sign up again with a new account

## Quick Test

After disabling email confirmation:
1. Sign up with a new email
2. You should be able to sign in immediately
3. No email confirmation needed!

