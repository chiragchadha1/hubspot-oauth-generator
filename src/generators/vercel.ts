import fs from 'fs-extra';
import path from 'path';
import { generateVercelTemplates } from '../templates/vercel/index.js';
import { generateSharedFiles } from './shared.js';
import type { GeneratorConfig } from '../types/index.js';

export async function generateVercelProject(
  outputPath: string,
  config: GeneratorConfig,
  rootDir: string
): Promise<void> {
  // Create directory structure
  await fs.ensureDir(path.join(outputPath, 'api'));
  await fs.ensureDir(path.join(outputPath, 'lib'));

  // Generate template files (always TypeScript)
  const templates = generateVercelTemplates(config);

  // Write API routes
  if (config.features.includes('oauth-install')) {
    await fs.writeFile(
      path.join(outputPath, 'api', 'oauth-install.ts'),
      templates['api/oauth-install.ts']
    );
  }

  if (config.features.includes('oauth-callback')) {
    await fs.writeFile(
      path.join(outputPath, 'api', 'oauth-callback.ts'),
      templates['api/oauth-callback.ts']
    );
  }

  if (config.features.includes('oauth-refresh')) {
    await fs.writeFile(
      path.join(outputPath, 'api', 'oauth-refresh.ts'),
      templates['api/oauth-refresh.ts']
    );
  }

  if (config.features.includes('example-api')) {
    await fs.writeFile(
      path.join(outputPath, 'api', 'example-api.ts'),
      templates['api/example-api.ts']
    );
  }

  // Write library files
  await fs.writeFile(
    path.join(outputPath, 'lib', 'db.ts'),
    templates['lib/db.ts']
  );

  await fs.writeFile(
    path.join(outputPath, 'lib', 'hubspot-client.ts'),
    templates['lib/hubspot-client.ts']
  );

  if (config.features.includes('signature-validation')) {
    await fs.writeFile(
      path.join(outputPath, 'lib', 'hubspot-signature.ts'),
      templates['lib/hubspot-signature.ts']
    );
  }

  // Write database setup
  await fs.writeFile(
    path.join(outputPath, 'schema.sql'),
    templates['schema.sql']
  );

  // Write package.json
  await fs.writeFile(
    path.join(outputPath, 'package.json'),
    templates['package.json']
  );

  // Write vercel.json config
  await fs.writeFile(
    path.join(outputPath, 'vercel.json'),
    templates['vercel.json']
  );

  // Generate shared files
  await generateSharedFiles(outputPath, config, 'vercel');

  // Copy .gitignore
  await fs.writeFile(
    path.join(outputPath, '.gitignore'),
    templates['.gitignore']
  );
}
