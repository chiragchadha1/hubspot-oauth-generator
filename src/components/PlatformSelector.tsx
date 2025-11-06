import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { Platform } from '../types/index.js';

interface Props {
  onSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<Props> = ({ onSelect }) => {
  const items = [
    {
      label: '🔺 Vercel (Node.js Serverless Functions)',
      value: 'vercel',
    },
    {
      label: '⚡ Supabase (Deno Edge Functions)',
      value: 'supabase',
    },
  ];

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        Which platform do you want to use?
      </Text>
      <SelectInput
        items={items}
        onSelect={(item) => onSelect(item.value as Platform)}
      />
    </Box>
  );
};

