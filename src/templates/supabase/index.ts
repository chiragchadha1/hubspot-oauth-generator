import { oauthInstallTemplate } from './functions/oauth-install.js';
import { oauthCallbackTemplate } from './functions/oauth-callback.js';
import { oauthRefreshTemplate } from './functions/oauth-refresh.js';
import { exampleApiTemplate } from './functions/example-api.js';
import { hubspotClientTemplate } from './shared/hubspot-client.js';
import { hubspotSignatureTemplate } from './shared/hubspot-signature.js';
import { denoJsonTemplate } from './deno.js';
import { migrationTemplate } from './migration.js';
import { configTomlTemplate } from './config.js';
import { packageJsonTemplate } from './package.js';
import { gitignoreTemplate } from './gitignore.js';
import type { GeneratorConfig } from '../../types/index.js';

export function generateSupabaseTemplates(config: GeneratorConfig): Record<string, string> {
  return {
    'supabase/functions/oauth-install/index.ts': oauthInstallTemplate(config),
    'supabase/functions/oauth-callback/index.ts': oauthCallbackTemplate(config),
    'supabase/functions/oauth-refresh/index.ts': oauthRefreshTemplate(config),
    'supabase/functions/example-api/index.ts': exampleApiTemplate(config),
    'supabase/functions/_shared/hubspot-client.ts': hubspotClientTemplate(config),
    'supabase/functions/_shared/hubspot-signature.ts': hubspotSignatureTemplate(config),
    'supabase/functions/deno.json': denoJsonTemplate(config),
    'supabase/migrations/20250104000000_create_oauth_tables.sql': migrationTemplate(config),
    'supabase/config.toml': configTomlTemplate(config),
    'package.json': packageJsonTemplate(config),
    '.gitignore': gitignoreTemplate(config),
  };
}

