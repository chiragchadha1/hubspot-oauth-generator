import type { GeneratorConfig, Platform } from '../../types/index.js';

export function generateReadme(config: GeneratorConfig, platform: Platform): string {
  const isVercel = platform === 'vercel';
  const platformName = isVercel ? 'Vercel' : 'Supabase';
  const runtime = isVercel ? 'Node.js Serverless Functions' : 'Deno Edge Functions';

  let databaseSection = '';
  if (isVercel) {
    if (config.database === 'supabase') {
      databaseSection = `### Database Setup: Supabase PostgreSQL

**Why Supabase?** More generous free tier, never pauses, includes bonus features like Auth and Storage.

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Click "New Project" and choose a name, database password, and region
   - Wait for your project to be provisioned (~2 minutes)

2. **Run the database schema:**
   - In your Supabase dashboard, go to **SQL Editor**
   - Copy the contents of \`schema.sql\` from this project
   - Paste and click "Run" to create the \`oauth_tokens\` table

3. **Get your credentials:**
   - Go to **Settings → API**
   - Copy your **Project URL** (looks like \`https://xxx.supabase.co\`)
   - Copy your **service_role secret key** (NOT the anon public key!)
`;
    } else if (config.database === 'vercel-postgres') {
      databaseSection = `### Database Setup: Vercel Postgres (Neon Serverless)

**Why Vercel Postgres?** Native integration with Vercel, zero-config environment variables, easiest setup.

⚠️ **Important:** You must create the Vercel Postgres database AFTER deploying your project to Vercel (see Step 4 first).

1. **Deploy to Vercel first** (see Step 4 below)
2. **Create the database:**
   - Go to your Vercel project dashboard
   - Click **Storage** tab → **Create Database** → **Postgres**
   - Select **"Neon (Serverless Postgres)"** as the database provider
   - Choose a database name and region (pick the same region as your functions: \`iad1\` by default)
   - **Do NOT enable Auth** (we only need the database, not user authentication)

3. **Configure the database:**
   - **Connect to:** Select your project (should be pre-selected)
   - **Environments:** Check all three: ✅ Development, ✅ Preview, ✅ Production
   - **Create database branch for:** Check ✅ Production (and optionally ✅ Preview for branch-specific databases)
   - **Custom Prefix:** Leave as default (\`POSTGRES_\`) or change if needed
   - Click **Create** - Vercel will automatically inject environment variables into your project

4. **Run the schema:**
   - In Vercel's **Storage** tab, click on your database
   - Click **"Open in Neon Console"** (top right)
   - In the Neon Console, go to **SQL Editor** in the left sidebar
   - Copy the contents of \`schema.sql\` from this project
   - Paste into the editor and click **"Run"** to create the \`oauth_tokens\` table

✅ **That's it!** Vercel automatically connects your database - no manual environment variables needed.
`;
    } else {
      databaseSection = `### Database Setup: PostgreSQL

1. Set up your PostgreSQL database (e.g., Railway, PlanetScale, Neon)
2. Run the \`schema.sql\` file to create the necessary tables
3. Get your connection string (looks like \`postgresql://user:pass@host:5432/db\`)
4. You'll add this as \`DATABASE_URL\` in Step 3
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

  const deploymentInstructions = isVercel ? `### Deploy THIS Backend to Vercel

**Important:** This deploys the OAuth backend only, NOT your HubSpot project!

**Prerequisites:**
- This backend must be in its own Git repository (separate from your HubSpot project)
- Vercel requires GitHub, GitLab, or Bitbucket

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push this backend to its own Git repo:**
   \`\`\`bash
   # Navigate to THIS backend folder (not your HubSpot project!)
   cd ${config.projectName}

   # Initialize git
   git init
   git add .
   git commit -m "Initial commit: HubSpot OAuth backend"

   # Create a NEW repo on GitHub (e.g., "my-hubspot-oauth-backend")
   # Then push to it
   git remote add origin YOUR_GIT_REPO_URL
   git push -u origin main
   \`\`\`

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import" next to your **backend** Git repository
   - Vercel will auto-detect the settings
   - Click "Deploy"

3. **Your backend API endpoints will be:**
   - \`https://YOUR_PROJECT.vercel.app/api/oauth-install\`
   - \`https://YOUR_PROJECT.vercel.app/api/oauth-callback\`
   - \`https://YOUR_PROJECT.vercel.app/api/oauth-refresh\`
   - \`https://YOUR_PROJECT.vercel.app/api/example-api\`

4. **Use these endpoints in your HubSpot project:**
   - Your HubSpot project (deployed separately with \`hs project upload\`) will call these endpoints
   - Reference these URLs in your HubSpot project code

#### Option B: Deploy via CLI

\`\`\`bash
# Navigate to THIS backend folder
cd ${config.projectName}

# Install dependencies
npm install

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy (will prompt you to link/create project)
vercel

# Deploy to production
vercel --prod
\`\`\`

**Note:**
- Files in \`/api\` automatically become serverless function endpoints
- Your HubSpot project stays separate and deploys to HubSpot using \`hs project upload\`
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

${isVercel ? `## ⚠️ Important: This is a Standalone Backend

This is **NOT** your HubSpot project! This is a separate backend service that manages OAuth tokens.

**Architecture:**
- **This Backend** → Deployed to Vercel (handles OAuth, stores tokens)
- **Your HubSpot Project** → Deployed to HubSpot using \`hs project upload\` (UI extensions, CRM cards, etc.)
- Your HubSpot project **calls** the API endpoints provided by this backend

**Deployment:**
1. This backend lives in its **own Git repository**
2. Deploy this backend to Vercel (see steps below)
3. Your HubSpot project references these endpoints

` : ''}
## ✨ Features

- ✅ **Complete OAuth 2.0 Flow** - Handle HubSpot authorization seamlessly
- ✅ **Automatic Token Refresh** - Never worry about expired tokens
- ✅ **Secure Database Storage** - Encrypted token storage
${config.features.includes('signature-validation') ? '- ✅ **HubSpot Signature Validation** - Support for v3, v2, and v1 signatures\n' : ''}- ✅ **${runtime}** - Fast, globally distributed serverless functions
- ✅ **Production Ready** - Error handling, logging, and best practices built-in

${isVercel ? `## 🏗️ How This Works

### Serverless Architecture

This backend uses **Vercel Serverless Functions** - no traditional server required!

**What are Serverless Functions?**
- Each file in \`/api\` becomes an HTTP endpoint automatically
- Functions run on-demand when called (not running 24/7)
- Auto-scales to handle any traffic
- You only pay for actual execution time (generous free tier)

**Example:**
- \`api/oauth-install.ts\` → \`https://your-project.vercel.app/api/oauth-install\`
- \`api/oauth-callback.ts\` → \`https://your-project.vercel.app/api/oauth-callback\`

**Why This Matters:**
- ✅ No server management
- ✅ Auto-scaling built-in
- ✅ Global CDN distribution
- ✅ Pay-per-use pricing
- ✅ Always up-to-date Node.js runtime

### Database Requirement

OAuth tokens **must** be stored in a database because:
1. Tokens need to persist between function calls
2. Tokens need to be securely stored and retrieved
3. Multiple HubSpot portals can install your app (each needs their own tokens)

${config.database === 'vercel-postgres' ? 'This project uses **Vercel Postgres (powered by Neon Serverless)** which integrates seamlessly with zero configuration.' : config.database === 'supabase' ? 'This project uses **Supabase** which offers a generous free tier and never pauses.' : 'This project uses PostgreSQL for token storage.'}

` : ''}## 📁 What's Included

### Endpoints
${config.features.includes('oauth-install') ? '- **oauth-install** - Initiates OAuth flow and redirects to HubSpot\n' : ''}${config.features.includes('oauth-callback') ? '- **oauth-callback** - Handles OAuth callback and stores tokens\n' : ''}${config.features.includes('oauth-refresh') ? '- **oauth-refresh** - Manual token refresh endpoint (optional)\n' : ''}${config.features.includes('example-api') ? '- **example-api** - Example authenticated API call\n' : ''}
## 🚀 Quick Start

${isVercel && config.database === 'vercel-postgres' ? `⚠️ **Setup Order Matters for Vercel Postgres:**
1. Create HubSpot App (Step 1)
2. Deploy to Vercel first (Step 2)
3. Create Vercel Postgres database (Step 3)
4. Configure environment variables (Step 4)
5. Test OAuth flow (Step 5)

` : ''}### 1. Configure HubSpot App

${isVercel ? `**For HubSpot projects (2025.2+):**

Update your HubSpot project's \`app-hsmeta.json\` file with the backend callback URL:

\`\`\`json
{
  "type": "app",
  "config": {
    "auth": {
      "type": "oauth",
      "redirectUrls": [
        "https://YOUR_PROJECT.vercel.app/api/oauth-callback"
      ],
      "requiredScopes": [
        "oauth",
        "crm.objects.contacts.read",
        "crm.objects.contacts.write"
      ]
    },
    "permittedUrls": {
      "fetch": [
        "https://api.hubapi.com",
        "https://YOUR_PROJECT.vercel.app"
      ]
    }
  }
}
\`\`\`

**Note:** You'll get \`YOUR_PROJECT\` after deploying the backend in Step 2.

**Get your OAuth credentials:**
1. Deploy your HubSpot project: \`hs project upload\`
2. Go to [HubSpot Developers](https://developers.hubspot.com)
3. Find your app → **Auth** tab
4. Copy your **Client ID** and **Client Secret**
` : `1. Go to [HubSpot Developers](https://developers.hubspot.com)
2. Click **Apps** → **Create app**
3. Go to **Auth** tab to get your **Client ID** and **Client Secret**
4. Under **Redirect URLs**, add your callback endpoint`}

### 2. ${isVercel && config.database === 'vercel-postgres' ? 'Deploy to Vercel' : 'Database Setup'}

${isVercel && config.database === 'vercel-postgres' ? deploymentInstructions : databaseSection}

### 3. ${isVercel && config.database === 'vercel-postgres' ? 'Database Setup (Do AFTER deploying)' : 'Configure Environment Variables'}

${isVercel && config.database === 'vercel-postgres' ? databaseSection : `**When:** Set these AFTER deploying to Vercel (Step 4), but BEFORE testing OAuth.

**Where:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these variables:**

\`\`\`bash
# Required: HubSpot OAuth credentials
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
# This MUST match the redirectUrls in your HubSpot project's app-hsmeta.json
HUBSPOT_REDIRECT_URI=https://YOUR_PROJECT.vercel.app/api/oauth-callback
${config.database === 'supabase' ? '\n# Required: Supabase database credentials\nSUPABASE_URL=https://xxx.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=your-service-role-key' : ''}${config.database === 'vercel-postgres' ? '\n# Vercel Postgres variables are automatically added when you create the database\n# No manual configuration needed for database!' : ''}${config.database === 'postgres' ? '\n# Required: Your PostgreSQL connection string\nDATABASE_URL=postgresql://user:password@host:5432/database' : ''}${config.features.includes('signature-validation') ? '\n\n# Optional: Enable HubSpot signature validation (recommended for production)\nREQUIRE_HUBSPOT_SIGNATURE=true  # Set to false for local testing' : ''}
\`\`\`

⚠️ **Important:** After adding environment variables, you must redeploy your project for them to take effect.
- Vercel Dashboard: Go to Deployments → Click "..." → Redeploy
- Or push a new commit to trigger automatic redeployment
`}

### 4. ${isVercel && config.database === 'vercel-postgres' ? 'Configure Environment Variables' : 'Deploy'}

${isVercel && config.database === 'vercel-postgres' ? `**When:** Set these AFTER creating the database (Step 3), but BEFORE testing OAuth.

**Where:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these variables:**

\`\`\`bash
# Required: HubSpot OAuth credentials
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-client-secret
# This MUST match the redirectUrls in your HubSpot project's app-hsmeta.json
HUBSPOT_REDIRECT_URI=https://YOUR_PROJECT.vercel.app/api/oauth-callback

# Vercel Postgres variables are automatically added when you create the database
# No manual configuration needed for database!

${config.features.includes('signature-validation') ? '# Optional: Enable HubSpot signature validation (recommended for production)\nREQUIRE_HUBSPOT_SIGNATURE=true  # Set to false for local testing' : ''}
\`\`\`

⚠️ **Important:** After adding environment variables, you must redeploy your project for them to take effect.
- Vercel Dashboard: Go to Deployments → Click "..." → Redeploy
- Or push a new commit to trigger automatic redeployment
` : deploymentInstructions}

### 5. Test OAuth Flow

${isVercel ? `Visit: \`https://YOUR_PROJECT.vercel.app/api/oauth-install\`` : `Visit: \`https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-install\``}

After authorization, tokens will be stored in your database!

## 💻 Local Development

${isVercel ? `### Running Locally with Vercel CLI

1. **Navigate to project directory:**
   \`\`\`bash
   cd ${config.projectName}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Create \`.env.local\` file:**
   \`\`\`bash
   HUBSPOT_CLIENT_ID=your-client-id
   HUBSPOT_CLIENT_SECRET=your-client-secret
   HUBSPOT_REDIRECT_URI=http://localhost:3000/api/oauth-callback
   ${config.database === 'supabase' ? 'SUPABASE_URL=https://xxx.supabase.co\n   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key' : ''}${config.database === 'vercel-postgres' ? 'POSTGRES_URL="postgresql://..." # Get from Vercel dashboard' : ''}${config.database === 'postgres' ? 'DATABASE_URL=postgresql://...' : ''}${config.features.includes('signature-validation') ? '\n   REQUIRE_HUBSPOT_SIGNATURE=false # Disable for local testing' : ''}
   \`\`\`

4. **Start dev server:**
   \`\`\`bash
   vercel dev
   \`\`\`

5. **Test locally:**
   - Visit \`http://localhost:3000/api/oauth-install\`
   - Update your HubSpot app redirect URL to include \`http://localhost:3000/api/oauth-callback\`

**Note:** The Vercel CLI simulates the Vercel environment locally, so your functions work exactly as they would in production.
` : `\`\`\`bash
# Start Supabase locally
supabase start

# Run a function locally
supabase functions serve oauth-install --env-file .env.local

# Test the function
curl http://localhost:54321/functions/v1/oauth-install
\`\`\`
`}

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

