import React from 'react';
import { Box, Text } from 'ink';
import type { GeneratorConfig } from '../types/index.js';

interface Props {
  config: GeneratorConfig;
}

export const Success: React.FC<Props> = ({ config }) => {
  const isVercel = config.platform === 'vercel';

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box
        borderStyle="round"
        borderColor="green"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Text color="green" bold>
          ✨ OAuth backend generated successfully!
        </Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold color="cyan">
          📋 Next Steps:
        </Text>
        <Box flexDirection="column" marginLeft={2} marginTop={1}>
          <Text>
            1. <Text color="yellow">cd {config.projectName}</Text>
          </Text>
          <Text>
            2. Read the <Text color="yellow">README.md</Text> for setup
            instructions
          </Text>
          <Text>
            3. Install dependencies:{' '}
            <Text color="yellow">
              {isVercel ? 'npm install' : 'supabase link'}
            </Text>
          </Text>
          <Text>4. Configure your environment variables</Text>
          <Text>5. Deploy your backend!</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold color="cyan">
          📚 Documentation:
        </Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text dimColor>
            • HubSpot OAuth: https://developers.hubspot.com/docs/api/oauth-quickstart-guide
          </Text>
          <Text dimColor>
            • {isVercel ? 'Vercel' : 'Supabase'} Docs:{' '}
            {isVercel ? 'https://vercel.com/docs' : 'https://supabase.com/docs'}
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text bold color="green">
          Happy coding! 🚀
        </Text>
      </Box>
    </Box>
  );
};

