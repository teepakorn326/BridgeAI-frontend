/**
 * Base URL for the BridgeAI backend API.
 * Set NEXT_PUBLIC_API_URL in Vercel project settings.
 * Falls back to localhost for local dev.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
