export type Platform = 'vercel' | 'supabase';
export type Database = 'supabase' | 'vercel-postgres' | 'postgres';

export type Feature =
  | 'oauth-install'
  | 'oauth-callback'
  | 'oauth-refresh'
  | 'example-api'
  | 'signature-validation';

export interface GeneratorConfig {
  platform: Platform;
  projectName: string;
  outputDir: string;
  database: Database;
  features: Feature[];
  includeEnvExample: boolean;
  includeReadme: boolean;
}

export interface SelectItem {
  label: string;
  value: string;
}

export interface TemplateContext {
  config: GeneratorConfig;
  platform: Platform;
}

