import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Header } from './Header.js';
import { PlatformSelector } from './PlatformSelector.js';
import { DatabaseSelector } from './DatabaseSelector.js';
import { ProjectInput } from './ProjectInput.js';
import { FeatureSelector } from './FeatureSelector.js';
import { GenerationProgress } from './GenerationProgress.js';
import { Success } from './Success.js';
import { generateProject } from '../utils/generator.js';
import type { GeneratorConfig, Platform, Database, Feature } from '../types/index.js';

type Step =
  | 'platform'
  | 'projectName'
  | 'outputDir'
  | 'database'
  | 'features'
  | 'confirm'
  | 'generating'
  | 'success'
  | 'error';

export const App: React.FC = () => {
  const [step, setStep] = useState<Step>('platform');
  const [config, setConfig] = useState<Partial<GeneratorConfig>>({});
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState('Initializing...');

  // Handle generation
  useEffect(() => {
    if (step === 'generating' && config.platform && config.projectName) {
      const fullConfig: GeneratorConfig = {
        platform: config.platform,
        projectName: config.projectName,
        outputDir: config.outputDir || `./${config.projectName}`,
        database: config.database || 'supabase',
        features: config.features || [],
        includeEnvExample: true,
        includeReadme: true,
      };

      generateProject(fullConfig, setGenerationStatus)
        .then(() => {
          setConfig(fullConfig);
          setStep('success');
        })
        .catch((err) => {
          setError(err.message);
          setStep('error');
        });
    }
  }, [step, config]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      {step === 'platform' && (
        <PlatformSelector
          onSelect={(platform: Platform) => {
            setConfig({ ...config, platform });
            setStep('projectName');
          }}
        />
      )}

      {step === 'projectName' && (
        <ProjectInput
          label="Project name:"
          defaultValue="hubspot-oauth-backend"
          onSubmit={(projectName: string) => {
            setConfig({ ...config, projectName });
            setStep('outputDir');
          }}
        />
      )}

      {step === 'outputDir' && (
        <ProjectInput
          label="Output directory:"
          defaultValue={`./${config.projectName}`}
          onSubmit={(outputDir: string) => {
            setConfig({ ...config, outputDir });
            setStep('database');
          }}
        />
      )}

      {step === 'database' && config.platform && (
        <DatabaseSelector
          platform={config.platform}
          onSelect={(database: Database) => {
            setConfig({ ...config, database });
            setStep('features');
          }}
        />
      )}

      {step === 'features' && (
        <FeatureSelector
          onSubmit={(features: Feature[]) => {
            setConfig({ ...config, features });
            setStep('generating');
          }}
        />
      )}

      {step === 'generating' && <GenerationProgress status={generationStatus} />}

      {step === 'success' && config.platform && config.projectName && (
        <Success config={config as GeneratorConfig} />
      )}

      {step === 'error' && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="red"
          paddingX={2}
          paddingY={1}
        >
          <Text color="red" bold>
            ❌ Error: {error}
          </Text>
        </Box>
      )}
    </Box>
  );
};

