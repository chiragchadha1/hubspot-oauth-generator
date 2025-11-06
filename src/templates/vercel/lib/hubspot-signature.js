export function hubspotSignatureTemplate(config) {
  return `import type { VercelRequest } from '@vercel/node';
import crypto from 'crypto';

/**
 * HubSpot Request Signature Validation
 *
 * Validates incoming requests from HubSpot using v3, v2, or v1 signature methods.
 * See: https://developers.hubspot.com/docs/api/webhooks/validating-requests
 */

/**
 * Validates v3 signature (HMAC-SHA256 with timestamp)
 * Used by: UI Extensions (hubspot.fetch), newer webhooks
 */
async function validateV3Signature(
  req: VercelRequest,
  body: string,
  clientSecret: string,
  signatureHeader: string,
  timestampHeader: string
): Promise<boolean> {
  const MAX_ALLOWED_TIMESTAMP = 300000; // 5 minutes in milliseconds
  const currentTime = Date.now();
  const requestTimestamp = parseInt(timestampHeader);

  // Reject requests with timestamps older than 5 minutes
  if (currentTime - requestTimestamp > MAX_ALLOWED_TIMESTAMP) {
    return false;
  }

  // Get the host and reconstruct the full URL
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  // req.url is just the path (e.g., /api/example-api?portalId=123)
  // We need to construct the full URL that HubSpot signed
  const fullUrl = \`\${protocol}://\${host}\${req.url}\`;

  // Parse to normalize
  const parsedUrl = new URL(fullUrl);
  let uri = parsedUrl.href;

  // Decode specific URL-encoded characters per HubSpot v3 specification
  const decodeMappings: Record<string, string> = {
    '%3A': ':', '%2F': '/', '%3F': '?', '%40': '@',
    '%21': '!', '%24': '$', '%27': "'", '%28': '(',
    '%29': ')', '%2A': '*', '%2C': ',', '%3B': ';'
  };

  for (const [encoded, decoded] of Object.entries(decodeMappings)) {
    uri = uri.replace(new RegExp(encoded, 'gi'), decoded);
  }

  const method = req.method;
  const sourceString = \`\${method}\${uri}\${body}\${timestampHeader}\`;

  // Generate HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(sourceString);
  const hashBase64 = hmac.digest('base64');

  return hashBase64 === signatureHeader;
}

/**
 * Validates v2 signature (SHA-256)
 * Used by: Workflow webhook actions, CRM cards
 */
async function validateV2Signature(
  req: VercelRequest,
  body: string,
  clientSecret: string,
  signatureHeader: string
): Promise<boolean> {
  // Get the host and reconstruct the full URL
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  // Construct the full URL that HubSpot signed
  const fullUrl = \`\${protocol}://\${host}\${req.url}\`;
  const parsedUrl = new URL(fullUrl);
  const uri = parsedUrl.href;
  const method = req.method;

  // v2: clientSecret + method + uri + body
  const sourceString = \`\${clientSecret}\${method}\${uri}\${body}\`;

  const hash = crypto.createHash('sha256');
  hash.update(sourceString);
  const hashHex = hash.digest('hex');

  return hashHex === signatureHeader;
}

/**
 * Validates v1 signature (SHA-256, legacy)
 * Used by: Legacy webhooks
 */
async function validateV1Signature(
  body: string,
  clientSecret: string,
  signatureHeader: string
): Promise<boolean> {
  // v1: clientSecret + body
  const sourceString = \`\${clientSecret}\${body}\`;

  const hash = crypto.createHash('sha256');
  hash.update(sourceString);
  const hashHex = hash.digest('hex');

  return hashHex === signatureHeader;
}

/**
 * Validates HubSpot request signatures (v3, v2, or v1)
 */
export async function validateHubSpotSignature(req: VercelRequest): Promise<boolean> {
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientSecret) {
    console.error('HUBSPOT_CLIENT_SECRET not configured');
    return false;
  }

  // Get request body as string
  // For GET requests or empty bodies, use empty string
  let body = '';
  if (req.body && Object.keys(req.body).length > 0) {
    // If body is already a string, use it as-is
    // Otherwise stringify with no spacing to match HubSpot's format
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  const v3Signature = req.headers['x-hubspot-signature-v3'] as string | undefined;
  const v3Timestamp = req.headers['x-hubspot-request-timestamp'] as string | undefined;
  const signatureVersion = req.headers['x-hubspot-signature-version'] as string | undefined;
  const signature = req.headers['x-hubspot-signature'] as string | undefined;

  // Try v3 first (latest version - used by hubspot.fetch())
  if (v3Signature && v3Timestamp) {
    const isValid = await validateV3Signature(req, body, clientSecret, v3Signature, v3Timestamp);
    if (isValid) {
      return true;
    }
  }

  // Try v2
  if (signatureVersion === 'v2' && signature) {
    const isValid = await validateV2Signature(req, body, clientSecret, signature);
    if (isValid) {
      return true;
    }
  }

  // Try v1 (legacy)
  if (signatureVersion === 'v1' && signature) {
    const isValid = await validateV1Signature(body, clientSecret, signature);
    if (isValid) {
      return true;
    }
  }

  console.error('Invalid HubSpot signature');
  return false;
}
`;
}
