export function exampleApiTemplate(config) {
  const includeSignatureValidation = config.features.includes('signature-validation');

  const signatureImport = includeSignatureValidation
    ? "import { validateHubSpotSignature } from '../_shared/hubspot-signature.ts';\n"
    : '';

  const signatureValidation = includeSignatureValidation ? `
    // Validate HubSpot signature (optional but recommended for production)
    const requireSignature = Deno.env.get('REQUIRE_HUBSPOT_SIGNATURE') !== 'false';

    if (requireSignature) {
      const CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET');
      if (!CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: 'HUBSPOT_CLIENT_SECRET not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' }}
        );
      }

      const bodyText = await req.text();
      const { valid } = await validateHubSpotSignature(req, bodyText, CLIENT_SECRET);

      if (!valid) {
        return new Response(
          JSON.stringify({ error: 'Invalid or missing HubSpot signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' }}
        );
      }
    }
` : '';

  return `/**
 * Example API Endpoint
 *
 * Demonstrates how to make authenticated HubSpot API calls.
 * Automatically handles token refresh if needed.
 * ${includeSignatureValidation ? 'Validates HubSpot request signatures for security.' : ''}
 *
 * Usage: GET /functions/v1/example-api?portal_id=12345
 */

import { HubSpotClient } from '../_shared/hubspot-client.ts';
${signatureImport}
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const portal_id = parseInt(url.searchParams.get('portal_id') || '');

    if (!portal_id || isNaN(portal_id)) {
      return new Response(
        JSON.stringify({ error: 'Valid portal_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }
${signatureValidation}
    // Create HubSpot client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const hubspot = new HubSpotClient({
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_SERVICE_ROLE_KEY,
      portalId: portal_id,
    });

    // Example: Get contacts
    const contacts = await hubspot.get('/crm/v3/objects/contacts?limit=10');

    return new Response(
      JSON.stringify({
        success: true,
        portal_id,
        data: contacts,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
});
`;
}

