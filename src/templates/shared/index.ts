import type { GeneratorConfig, Platform } from '../../types/index.js';

export function generateReadme(config: GeneratorConfig, platform: Platform): string {
  const isVercel = platform === 'vercel';
  const platformName = isVercel ? 'Vercel' : 'Supabase';
  const runtime = isVercel ? 'Node.js Serverless Functions' : 'Deno Edge Functions';

  let databaseSection = '';
  if (isVercel) {
    if (config.database === 'supabase') {
      databaseSection = `### Database: Supabase PostgreSQL

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your connection details from Settings → Database
3. Run the schema.sql file in the SQL Editor
`;
    } else if (config.database === 'vercel-postgres') {
      databaseSection = `### Database: Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Run the schema.sql file using Vercel's SQL editor or CLI
`;
    } else {
      databaseSection = `### Database: PostgreSQL

1. Set up your PostgreSQL database
2. Run the schema.sql file to create the necessary tables
3. Add your DATABASE_URL to environment variables
`;
    }
  } else {
    databaseSection = `### Database: Supabase PostgreSQL (Built-in)

The database is automatically created with your Supabase project.
Run the migration to set up the schema:

\`\`\`bash
supabase db push
\`\`\`
`;
  }

  const deploymentInstructions = isVercel ? `### Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - HUBSPOT_CLIENT_ID
# - HUBSPOT_CLIENT_SECRET
# - HUBSPOT_REDIRECT_URI
# - Database connection details (depending on your choice)
\`\`\`
` : `### Deploy to Supabase

\`\`\`bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy database migrations
supabase db push

# Set environment variables
supabase secrets set \\
  HUBSPOT_CLIENT_ID="your-client-id" \\
  HUBSPOT_CLIENT_SECRET="your-client-secret" \\
  HUBSPOT_REDIRECT_URI="https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-callback" \\
  SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \\
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Deploy functions
supabase functions deploy oauth-install
supabase functions deploy oauth-callback
supabase functions deploy oauth-refresh
supabase functions deploy example-api
\`\`\`
`;

  return `# 🚀 ${config.projectName}

A production-ready OAuth 2.0 backend for HubSpot apps built on ${platformName} (${runtime}).

## ✨ Features

- ✅ **Complete OAuth 2.0 Flow** - Handle HubSpot authorization seamlessly
- ✅ **Automatic Token Refresh** - Never worry about expired tokens
- ✅ **Secure Database Storage** - Encrypted token storage
${config.features.includes('signature-validation') ? '- ✅ **HubSpot Signature Validation** - Support for v3, v2, and v1 signatures\n' : ''}- ✅ **${runtime}** - Fast, globally distributed serverless functions
- ✅ **Production Ready** - Error handling, logging, and best practices built-in

## 📁 What's Included

### Endpoints
${config.features.includes('oauth-install') ? '- **oauth-install** - Initiates OAuth flow and redirects to HubSpot\n' : ''}${config.features.includes('oauth-callback') ? '- **oauth-callback** - Handles OAuth callback and stores tokens\n' : ''}${config.features.includes('oauth-refresh') ? '- **oauth-refresh** - Manual token refresh endpoint (optional)\n' : ''}${config.features.includes('example-api') ? '- **example-api** - Example authenticated API call\n' : ''}
## 🚀 Quick Start

### 1. Create HubSpot App

1. Go to [HubSpot Developers](https://developers.hubspot.com)
2. Click **Apps** → **Create app**
3. Go to **Auth** tab to get credentials
4. Set redirect URI to your callback endpoint

### 2. Set Up ${platformName}

${databaseSection}

### 3. Configure Environment Variables

${isVercel ? `Add these to your Vercel project (Settings → Environment Variables):

\`\`\`
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
HUBSPOT_REDIRECT_URI=https://your-domain.vercel.app/api/oauth-callback
${config.database === 'supabase' ? 'SUPABASE_URL=https://xxx.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=your-service-key' : ''}${config.database === 'vercel-postgres' ? '# Vercel Postgres env vars are auto-added' : ''}${config.database === 'postgres' ? 'DATABASE_URL=postgresql://...' : ''}${config.features.includes('signature-validation') ? '\nREQUIRE_HUBSPOT_SIGNATURE=true' : ''}
\`\`\`
` : `See deployment section above for setting Supabase secrets.`}

### 4. Deploy

${deploymentInstructions}

### 5. Test OAuth Flow

${isVercel ? `Visit: \`https://your-domain.vercel.app/api/oauth-install\`` : `Visit: \`https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-install\``}

After authorization, tokens will be stored in your database!

## 💻 Usage Examples

### Making Authenticated API Calls

${isVercel ? `\`\`\`javascript
import { HubSpotClient } from './lib/hubspot-client.js';

const hubspot = new HubSpotClient({ portalId: 12345 });

// Get contacts (tokens auto-refresh if needed)
const contacts = await hubspot.get('/crm/v3/objects/contacts?limit=10');
\`\`\`
` : `\`\`\`typescript
import { HubSpotClient } from '../_shared/hubspot-client.ts';

const hubspot = new HubSpotClient({
  supabaseUrl: Deno.env.get('SUPABASE_URL')!,
  supabaseKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  portalId: 12345,
});

// Get contacts (tokens auto-refresh if needed)
const contacts = await hubspot.get('/crm/v3/objects/contacts?limit=10');
\`\`\`
`}

${config.features.includes('signature-validation') ? `## 🔐 Signature Validation

This template validates HubSpot request signatures to ensure requests are authentic.

### Supported Versions
- **v3** (HMAC-SHA256 + timestamp) - Used by UI Extensions, latest webhooks
- **v2** (SHA-256) - Used by workflow actions, CRM cards
- **v1** (SHA-256, legacy) - Used by older webhooks

### Testing with Signature Validation

**For development/testing:**
\`\`\`bash
# Disable signature validation
${isVercel ? 'vercel env add REQUIRE_HUBSPOT_SIGNATURE' : 'supabase secrets set REQUIRE_HUBSPOT_SIGNATURE="false"'}
# Set to: false

# Re-enable for production
${isVercel ? 'vercel env add REQUIRE_HUBSPOT_SIGNATURE' : 'supabase secrets set REQUIRE_HUBSPOT_SIGNATURE="true"'}
# Set to: true
\`\`\`

**For production:** Keep signature validation enabled. Only requests from HubSpot with valid signatures will be accepted.
` : ''}

## 🔄 How Token Refresh Works

The HubSpotClient automatically handles token refresh:

1. Before each API call, checks if token is expired
2. If expired, refreshes token with HubSpot OAuth API
3. Updates database with new tokens
4. Retries the original request with fresh token
5. All happens transparently - you never need to worry about it!

## 🔒 Security

- ✅ Secure database storage with proper access controls
- ✅ Service role key for server-side operations only
${config.features.includes('signature-validation') ? '- ✅ HubSpot signature validation (v3, v2, v1)\n' : ''}- ✅ Automatic token refresh prevents stale credentials
- ✅ HTTPS-only endpoints
- ✅ Environment-based configuration (no hardcoded secrets)

## 🐛 Troubleshooting

### "No OAuth tokens found for this portal"
**Solution:** Complete the OAuth flow first by visiting the oauth-install endpoint.

${config.features.includes('signature-validation') ? `### "HubSpot signature required" (when testing with curl/Postman)
**Solution:** Disable signature validation for development:
\`\`\`bash
${isVercel ? 'vercel env add REQUIRE_HUBSPOT_SIGNATURE' : 'supabase secrets set REQUIRE_HUBSPOT_SIGNATURE="false"'}
# Set to: false
\`\`\`
` : ''}
### OAuth callback fails
**Solution:** Verify redirect URI matches exactly in both HubSpot app settings and your environment variables.

## 📚 Additional Resources

- [HubSpot OAuth Documentation](https://developers.hubspot.com/docs/api/oauth-quickstart-guide)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/overview)
${isVercel ? '- [Vercel Documentation](https://vercel.com/docs)' : '- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)'}
${config.features.includes('signature-validation') ? '- [HubSpot Signature Validation](https://developers.hubspot.com/docs/api/webhooks/validating-requests)\n' : ''}
---

**Generated with [oauth-backend-generator](https://github.com/your-username/oauth-backend-generator)** ⚡
`;
}

export function generateEnvExample(config: GeneratorConfig, platform: Platform): string {
  const isVercel = platform === 'vercel';

  let dbVars = '';
  if (isVercel) {
    if (config.database === 'supabase') {
      dbVars = `
# Supabase Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`;
    } else if (config.database === 'vercel-postgres') {
      dbVars = `
# Vercel Postgres (auto-configured by Vercel)
# No manual configuration needed
`;
    } else {
      dbVars = `
# PostgreSQL Database
DATABASE_URL=postgresql://user:password@host:5432/database
`;
    }
  } else {
    dbVars = `
# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`;
  }

  return `# HubSpot OAuth Configuration
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
HUBSPOT_REDIRECT_URI=${isVercel ? 'https://your-domain.vercel.app/api/oauth-callback' : 'https://xxx.supabase.co/functions/v1/oauth-callback'}
${dbVars}${config.features.includes('signature-validation') ? `
# Security
REQUIRE_HUBSPOT_SIGNATURE=true
` : ''}`;
}

export function generateLicense(): string {
  return `MIT License

Copyright (c) ${new Date().getFullYear()}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

