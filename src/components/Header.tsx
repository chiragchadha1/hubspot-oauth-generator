import React from 'react';
import { Box, Text } from 'ink';

export const Header: React.FC = () => (
  <Box
    flexDirection="column"
    marginBottom={1}
    borderStyle="round"
    borderColor="cyan"
    paddingX={2}
  >
    <Text color="cyan" bold>
      🚀 OAuth Backend Generator for HubSpot
    </Text>
    <Text dimColor>
      Generate production-ready OAuth backends for Vercel or Supabase
    </Text>
  </Box>
);

