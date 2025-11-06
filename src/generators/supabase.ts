import fs from 'fs-extra';
import path from 'path';
import { generateSupabaseTemplates } from '../templates/supabase/index.js';
import { generateSharedFiles } from './shared.js';
import type { GeneratorConfig } from '../types/index.js';

export async function generateSupabaseProject(
  outputPath: string,
  config: GeneratorConfig,
  rootDir: string
): Promise<void> {
  // Create directory structure
  await fs.ensureDir(path.join(outputPath, 'supabase', 'functions', '_shared'));
  await fs.ensureDir(path.join(outputPath, 'supabase', 'migrations'));

  // Generate template files
  const templates = generateSupabaseTemplates(config);

  // Write Edge Functions
  if (config.features.includes('oauth-install')) {
    await fs.ensureDir(path.join(outputPath, 'supabase', 'functions', 'oauth-install'));
    await fs.writeFile(
      path.join(outputPath, 'supabase', 'functions', 'oauth-install', 'index.ts'),
      templates['supabase/functions/oauth-install/index.ts']
    );
  }

  if (config.features.includes('oauth-callback')) {
    await fs.ensureDir(path.join(outputPath, 'supabase', 'functions', 'oauth-callback'));
    await fs.writeFile(
      path.join(outputPath, 'supabase', 'functions', 'oauth-callback', 'index.ts'),
      templates['supabase/functions/oauth-callback/index.ts']
    );
  }

  if (config.features.includes('oauth-refresh')) {
    await fs.ensureDir(path.join(outputPath, 'supabase', 'functions', 'oauth-refresh'));
    await fs.writeFile(
      path.join(outputPath, 'supabase', 'functions', 'oauth-refresh', 'index.ts'),
      templates['supabase/functions/oauth-refresh/index.ts']
    );
  }

  if (config.features.includes('example-api')) {
    await fs.ensureDir(path.join(outputPath, 'supabase', 'functions', 'example-api'));
    await fs.writeFile(
      path.join(outputPath, 'supabase', 'functions', 'example-api', 'index.ts'),
      templates['supabase/functions/example-api/index.ts']
    );
  }

  // Write shared utilities
  await fs.writeFile(
    path.join(outputPath, 'supabase', 'functions', '_shared', 'hubspot-client.ts'),
    templates['supabase/functions/_shared/hubspot-client.ts']
  );

  if (config.features.includes('signature-validation')) {
    await fs.writeFile(
      path.join(outputPath, 'supabase', 'functions', '_shared', 'hubspot-signature.ts'),
      templates['supabase/functions/_shared/hubspot-signature.ts']
    );
  }

  // Write Deno config
  await fs.writeFile(
    path.join(outputPath, 'supabase', 'functions', 'deno.json'),
    templates['supabase/functions/deno.json']
  );

  // Write migration
  await fs.writeFile(
    path.join(outputPath, 'supabase', 'migrations', '20250104000000_create_oauth_tables.sql'),
    templates['supabase/migrations/20250104000000_create_oauth_tables.sql']
  );

  // Write config.toml
  await fs.writeFile(
    path.join(outputPath, 'supabase', 'config.toml'),
    templates['supabase/config.toml']
  );

  // Write package.json
  await fs.writeFile(
    path.join(outputPath, 'package.json'),
    templates['package.json']
  );

  // Generate shared files
  await generateSharedFiles(outputPath, config, 'supabase');

  // Copy .gitignore
  await fs.writeFile(
    path.join(outputPath, '.gitignore'),
    templates['.gitignore']
  );
}
