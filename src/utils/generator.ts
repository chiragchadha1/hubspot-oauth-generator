import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GeneratorConfig } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateProject(
  config: GeneratorConfig,
  setStatus: (status: string) => void
): Promise<void> {
  const outputPath = path.resolve(config.outputDir);

  setStatus('Checking output directory...');

  // Check if directory exists and remove it
  if (await fs.pathExists(outputPath)) {
    setStatus('Removing existing directory...');
    await fs.remove(outputPath);
  }

  setStatus('Creating project structure...');
  await fs.ensureDir(outputPath);

  // Import generators dynamically
  if (config.platform === 'vercel') {
    setStatus('Generating Vercel project files...');
    const { generateVercelProject } = await import('../generators/vercel.js');
    const rootDir = path.resolve(__dirname, '../..');
    await generateVercelProject(outputPath, config, rootDir);
  } else {
    setStatus('Generating Supabase project files...');
    const { generateSupabaseProject } = await import('../generators/supabase.js');
    const rootDir = path.resolve(__dirname, '../..');
    await generateSupabaseProject(outputPath, config, rootDir);
  }

  setStatus('Project generated successfully!');
}

