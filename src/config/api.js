/**
 * API Configuration
 * Uses environment variable for API URL, falls back to localhost for development
 * 
 * For Cloudflare Pages deployment:
 * - If REACT_APP_API_URL is not set, use relative URLs (same domain) in production
 * - This allows the Pages Functions to handle the API routes
 * - For local development, use localhost:5000
 */

// If deployed on Cloudflare Pages, use relative URLs (empty string = same origin)
// For local development, use localhost
const API_URL = process.env.REACT_APP_API_URL !== undefined 
  ? process.env.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default API_URL;

