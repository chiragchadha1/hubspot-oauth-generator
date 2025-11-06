import { oauthInstallTemplate } from './api/oauth-install.js';
import { oauthCallbackTemplate } from './api/oauth-callback.js';
import { oauthRefreshTemplate } from './api/oauth-refresh.js';
import { exampleApiTemplate } from './api/example-api.js';
import { dbTemplate } from './lib/db.js';
import { hubspotClientTemplate } from './lib/hubspot-client.js';
import { hubspotSignatureTemplate } from './lib/hubspot-signature.js';
import { schemaTemplate } from './schema.js';
import { packageJsonTemplate } from './package.js';
import { vercelJsonTemplate } from './vercel.js';
import { gitignoreTemplate } from './gitignore.js';
import type { GeneratorConfig } from '../../types/index.js';

export function generateVercelTemplates(config: GeneratorConfig): Record<string, string> {
  // Always generate TypeScript
  return {
    'api/oauth-install.ts': oauthInstallTemplate(config),
    'api/oauth-callback.ts': oauthCallbackTemplate(config),
    'api/oauth-refresh.ts': oauthRefreshTemplate(config),
    'api/example-api.ts': exampleApiTemplate(config),
    'lib/db.ts': dbTemplate(config),
    'lib/hubspot-client.ts': hubspotClientTemplate(config),
    'lib/hubspot-signature.ts': hubspotSignatureTemplate(config),
    'schema.sql': schemaTemplate(config),
    'package.json': packageJsonTemplate(config),
    'vercel.json': vercelJsonTemplate(config),
    '.gitignore': gitignoreTemplate(config),
  };
}

