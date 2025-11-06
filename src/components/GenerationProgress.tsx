import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface Props {
  status: string;
}

export const GenerationProgress: React.FC<Props> = ({ status }) => (
  <Box flexDirection="column" marginTop={1}>
    <Box>
      <Text color="cyan">
        <Spinner type="dots" />
      </Text>
      <Text> {status}</Text>
    </Box>
  </Box>
);

