export function oauthInstallTemplate(config) {
  return `import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * OAuth Installation Endpoint
 *
 * Redirects users to HubSpot's OAuth authorization page.
 * After authorization, HubSpot will redirect back to oauth-callback.
 *
 * Usage: Direct users to this endpoint to install your app
 */

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
    const REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;

    if (!CLIENT_ID || !REDIRECT_URI) {
      return res.status(500).json({
        error: 'Missing required environment variables'
      });
    }

    const SCOPES = [
      'oauth',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write'
    ].join(' ');

    const state = crypto.randomUUID();

    const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('state', state);

    // Redirect to HubSpot OAuth page
    res.redirect(302, authUrl.toString());

  } catch (error) {
    console.error('OAuth install error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
}
`;
}

