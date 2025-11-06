import fs from 'fs-extra';
import path from 'path';
import { generateReadme, generateEnvExample, generateLicense } from '../templates/shared/index.js';
import type { GeneratorConfig, Platform } from '../types/index.js';

export async function generateSharedFiles(
  outputPath: string,
  config: GeneratorConfig,
  platform: Platform
): Promise<void> {
  // Generate README
  if (config.includeReadme) {
    const readme = generateReadme(config, platform);
    await fs.writeFile(path.join(outputPath, 'README.md'), readme);
  }

  // Generate .env.example
  if (config.includeEnvExample) {
    const envExample = generateEnvExample(config, platform);
    await fs.writeFile(path.join(outputPath, '.env.example'), envExample);
  }

  // Generate LICENSE
  const license = generateLicense();
  await fs.writeFile(path.join(outputPath, 'LICENSE'), license);
}
