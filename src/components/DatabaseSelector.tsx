import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { Database, Platform } from '../types/index.js';

interface Props {
  platform: Platform;
  onSelect: (database: Database) => void;
}

export const DatabaseSelector: React.FC<Props> = ({ platform, onSelect }) => {
  const items = platform === 'vercel'
    ? [
        { label: '🔺 Vercel Postgres (Recommended - Easiest Setup)', value: 'vercel-postgres' },
        { label: '🟢 Supabase (More Generous Free Tier)', value: 'supabase' },
        { label: '🐘 Other PostgreSQL', value: 'postgres' },
      ]
    : [{ label: '⚡ Supabase PostgreSQL (Built-in)', value: 'supabase' }];

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        Which database do you want to use?
      </Text>
      <SelectInput
        items={items}
        onSelect={(item) => onSelect(item.value as Database)}
      />
    </Box>
  );
};

