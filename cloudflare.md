# Cloudflare Pages Deployment Guide

## ⚠️ IMPORTANT: Use Pages, Not Workers

This is a **React static site** that should be deployed to **Cloudflare Pages**, NOT Cloudflare Workers.

- ✅ **Cloudflare Pages**: For static sites (React, Vue, etc.)
- ❌ **Cloudflare Workers**: For serverless functions/APIs

## Prerequisites

1. Cloudflare account
2. Node.js 18+ installed
3. Environment variables configured

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository (GitHub, GitLab, etc.)
4. **Configure build settings** (CRITICAL - must be set manually):
   - **Framework preset**: `React` (or `Create React App`)
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (leave empty or set to `/`)
   - **Node version**: `18` or higher
5. **Add environment variables** (under Settings → Environment variables):
   - `REACT_APP_SUPABASE_URL` = Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = Your Supabase anonymous key
6. Click **Save and Deploy**

**⚠️ IMPORTANT**: If you see "No build command specified", you must manually set the build settings in the dashboard. Cloudflare Pages may not auto-detect the build configuration.

### Option 2: Deploy via Wrangler CLI

1. Install Wrangler CLI:

   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:

   ```bash
   npx wrangler login
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages** (CRITICAL: use `pages deploy`):

   ```bash
   # Build first
   npm run build

   # Deploy using Wrangler Pages (NOT Workers)
   npx wrangler pages deploy build --project-name=medi-chat
   ```

   **⚠️ CRITICAL COMMAND DIFFERENCE**:

   - ✅ **Correct**: `npx wrangler pages deploy build --project-name=medi-chat`
   - ❌ **Wrong**: `npx wrangler deploy` (this deploys to Workers and will fail!)

   Or use the npm script:

   ```bash
   npm run deploy
   ```

## Common Errors and Solutions

### Error: "Infinite loop detected in \_redirects"

**Cause**: You're using `wrangler deploy` (Workers) instead of `wrangler pages deploy` (Pages).

**Solution**:

- Use `wrangler pages deploy` not `wrangler deploy`
- Workers don't support `_redirects` files the same way Pages does

### Error: "A request to /workers/scripts/..."

**Cause**: Wrangler is trying to deploy to Workers instead of Pages.

**Solution**:

- Use `wrangler pages deploy` command
- Make sure you're not using `wrangler deploy`

### Error: "Invalid \_redirects configuration"

**Cause**: The `_redirects` file is being processed by Workers instead of Pages.

**Solution**:

- Use `wrangler pages deploy` command
- The `_redirects` file in `public/` folder will work correctly with Pages

## Environment Variables

Set these in Cloudflare Pages dashboard under **Settings** → **Environment variables**:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Important**: Restart the build after adding environment variables.

## Build Configuration

- **Build command**: `npm run build`
- **Output directory**: `build`
- **Node version**: 18 or higher

## React Router Configuration

The `public/_redirects` file ensures that all routes are handled by React Router. This is necessary for client-side routing to work correctly.

**Note**: The `_redirects` file only works with Cloudflare Pages, not Workers.

## Troubleshooting

### Error: "No build command specified. Skipping build step."

**Cause**: Cloudflare Pages didn't detect the build configuration.

**Solution**:

1. Go to Cloudflare Dashboard → Pages → Your Project → Settings
2. Under **Builds & deployments**, set:
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (or leave empty)
3. Save and trigger a new deployment

### Error: "Output directory 'build' not found"

**Cause**: The build command didn't run, so the `build` directory doesn't exist.

**Solution**:

1. Make sure **Build command** is set to `npm run build` in the dashboard
2. Check that Node.js version is set to 18 or higher
3. Verify that `package.json` has a `build` script
4. Check build logs for errors during the build step

### Build Fails

- Check that all environment variables are set
- Verify Node.js version (18+) is set in dashboard
- Check build logs for specific errors
- Ensure `npm install` completes successfully before build

### Routes Don't Work

- Ensure `_redirects` file is in the `public/` folder (it will be copied to build)
- Verify the file is copied to the build output
- Make sure you're deploying to Pages, not Workers
- The `_redirects` file should contain: `/*  /index.html  200`

### Environment Variables Not Working

- Restart the build after adding variables
- Verify variable names start with `REACT_APP_`
- Check that variables are set for the correct environment (Production/Preview)
- Make sure variables are saved before deploying

### Deployment Goes to Workers Instead of Pages

- **Solution**: Always use `wrangler pages deploy`, never `wrangler deploy`
- Check that you're using the correct command in your CI/CD pipeline
- The `wrangler.toml` file is optional for Pages - you don't need `[assets]` section

### "No wrangler.toml file found"

**This is normal and OK!** Cloudflare Pages doesn't require `wrangler.toml` when using the dashboard. The build settings are configured in the dashboard UI.

## Notes

- The backend API (`api.py`) needs to be deployed separately (not on Cloudflare Pages)
- Consider using Cloudflare Workers for the backend API (separate from the frontend)
- For production, update API URLs in the frontend to point to your deployed backend
- The `wrangler.toml` file is optional - Pages can work without it when using CLI
