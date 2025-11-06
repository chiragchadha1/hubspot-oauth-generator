export function exampleApiTemplate(config) {
  const includeSignatureValidation = config.features.includes('signature-validation');

  const signatureImport = includeSignatureValidation
    ? "import { validateHubSpotSignature } from '../lib/hubspot-signature.js';\n"
    : '';

  const signatureValidation = includeSignatureValidation ? `
    // Validate HubSpot signature (recommended for production)
    // hubspot.fetch() from cards sends v3 signatures
    // Set REQUIRE_HUBSPOT_SIGNATURE=false to disable for testing
    const requireSignature = process.env.REQUIRE_HUBSPOT_SIGNATURE !== 'false';

    if (requireSignature) {
      const isValid = await validateHubSpotSignature(req);
      if (!isValid) {
        return res.status(401).json({
          error: 'Invalid or missing HubSpot signature'
        });
      }
    }
` : '';

  return `import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HubSpotClient } from '../lib/hubspot-client.js';
${signatureImport}
/**
 * Example API Endpoint
 *
 * Demonstrates how to make authenticated HubSpot API calls.
 * Automatically handles token refresh if needed.
 * ${includeSignatureValidation ? 'Validates HubSpot request signatures for security.' : ''}
 *
 * Usage: GET /api/example-api?portalId=12345
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const portalId = parseInt(req.query.portalId as string);

    if (!portalId || isNaN(portalId)) {
      return res.status(400).json({
        error: 'Valid portalId is required'
      });
    }
${signatureValidation}
    // Create HubSpot client
    const hubspot = new HubSpotClient({ portalId });

    // Example: Get contacts
    const contacts = await hubspot.get('/crm/v3/objects/contacts?limit=10');

    res.status(200).json({
      success: true,
      portalId,
      data: contacts,
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
}
`;
}
