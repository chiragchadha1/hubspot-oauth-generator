export function oauthRefreshTemplate(config) {
  return `import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db.js';

/**
 * OAuth Token Refresh Endpoint
 *
 * Manually refreshes OAuth tokens for a given portal.
 * Note: The HubSpotClient automatically refreshes tokens when needed,
 * so this endpoint is typically only needed for testing or manual refresh.
 *
 * Usage: GET/POST /api/oauth-refresh?portal_id=12345
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const portal_id = parseInt(req.query.portal_id as string || req.body?.portal_id);

    if (!portal_id || isNaN(portal_id)) {
      return res.status(400).json({ error: 'Valid portal_id is required' });
    }

    const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
    const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
    const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(500).json({
        error: 'Missing required environment variables'
      });
    }

    // Get current refresh token
    const db = await getDb();
    const result = await db.query(
      'SELECT * FROM oauth_tokens WHERE portal_id = $1',
      [portal_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'No tokens found for this portal'
      });
    }

    const tokenRecord = result.rows[0];

    // Refresh the token
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        refresh_token: tokenRecord.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh failed:', errorText);
      return res.status(500).json({
        error: 'Failed to refresh token',
        details: errorText
      });
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    const expires_at = new Date(Date.now() + expires_in * 1000);

    // Update tokens in database
    await db.query(
      \`UPDATE oauth_tokens
       SET access_token = $1,
           refresh_token = $2,
           expires_at = $3,
           updated_at = NOW()
       WHERE portal_id = $4\`,
      [access_token, refresh_token, expires_at, portal_id]
    );

    res.status(200).json({
      success: true,
      access_token,
      expires_at: expires_at.toISOString(),
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
}
`;
}
