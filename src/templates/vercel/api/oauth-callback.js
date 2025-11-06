export function oauthCallbackTemplate(config) {
  return `import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db.js';

/**
 * OAuth Callback Endpoint
 *
 * Handles the OAuth callback from HubSpot after user authorization.
 * Exchanges the authorization code for access and refresh tokens,
 * then stores them securely in the database.
 *
 * This is the REDIRECT_URI configured in your HubSpot app settings.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, error } = req.query;

    if (error) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(\`<h4>Error: \${error}</h4>\`);
    }

    if (!code || typeof code !== 'string') {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send('<h4>Error: No authorization code provided</h4>');
    }

    const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
    const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
    const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(500).send('Missing required environment variables');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.status(500).send(\`Failed to exchange code for tokens: \${errorText}\`);
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get portal ID from token info
    const tokenInfoResponse = await fetch(
      \`https://api.hubapi.com/oauth/v1/access-tokens/\${access_token}\`
    );

    if (!tokenInfoResponse.ok) {
      const errorText = await tokenInfoResponse.text();
      console.error('Failed to get token info:', errorText);
      return res.status(500).send('Failed to get account information');
    }

    const tokenInfo: any = await tokenInfoResponse.json();
    const portal_id = tokenInfo.hub_id;

    if (!portal_id) {
      console.error('No hub_id in token info:', tokenInfo);
      return res.status(500).send('Failed to extract portal ID from token');
    }

    const expires_at = new Date(Date.now() + expires_in * 1000);

    // Store tokens in database
    const db = await getDb();
    await db.query(
      \`INSERT INTO oauth_tokens (portal_id, access_token, refresh_token, expires_at, scopes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (portal_id)
       DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at,
         scopes = EXCLUDED.scopes,
         updated_at = NOW()\`,
      [portal_id, access_token, refresh_token, expires_at, tokenData.scopes || []]
    );

    // Simple HTML response like the quickstart guide
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(\`
<h2>OAuth Installation Successful</h2>
<p>Your HubSpot app has been successfully connected.</p>
<h4>Portal ID: \${portal_id}</h4>
<p>Scopes: \${tokenData.scopes ? tokenData.scopes.join(', ') : 'N/A'}</p>
<p>Status: Tokens securely stored in database</p>
<p><a href="/api/example-api?portalId=\${portal_id}">Test API call</a></p>
    \`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(\`Internal server error: \${(error as Error).message}\`);
  }
}
`;
}
