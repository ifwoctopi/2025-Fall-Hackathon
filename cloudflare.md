# Cloudflare Pages Deployment Guide

## Prerequisites

1. Cloudflare account
2. Node.js 18+ installed
3. Environment variables configured

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Configure build settings:
   - **Framework preset**: React
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (or leave empty)
5. Add environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
6. Click **Save and Deploy**

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

4. Deploy to Cloudflare Pages:

   ```bash
   # Build first
   npm run build

   # Deploy using Wrangler Pages (not Workers)
   npx wrangler pages deploy build --project-name=medical-simplifier
   ```

   **Note**: Use `wrangler pages deploy`, not `wrangler deploy`. The `pages` command is for Cloudflare Pages (static sites), while `deploy` is for Workers.

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

## Troubleshooting

### Build Fails

- Check that all environment variables are set
- Verify Node.js version (18+)
- Check build logs for specific errors

### Routes Don't Work

- Ensure `_redirects` file is in the `public` folder
- Verify the file is copied to the build output

### Environment Variables Not Working

- Restart the build after adding variables
- Verify variable names start with `REACT_APP_`
- Check that variables are set for the correct environment (Production/Preview)

## Notes

- The backend API (`api.py`) needs to be deployed separately (not on Cloudflare Pages)
- Consider using Cloudflare Workers for the backend API
- For production, update API URLs in the frontend to point to your deployed backend
