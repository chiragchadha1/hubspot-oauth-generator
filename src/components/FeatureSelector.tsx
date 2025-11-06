import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Feature } from '../types/index.js';

interface Props {
  onSubmit: (features: Feature[]) => void;
}

const FEATURES: Array<{ key: Feature; label: string; recommended: boolean }> = [
  { key: 'oauth-install', label: 'OAuth Installation Flow', recommended: true },
  { key: 'oauth-callback', label: 'OAuth Callback Handler', recommended: true },
  { key: 'oauth-refresh', label: 'Token Refresh Endpoint', recommended: true },
  { key: 'example-api', label: 'Example API Endpoint', recommended: true },
  {
    key: 'signature-validation',
    label: 'HubSpot Signature Validation',
    recommended: true,
  },
];

export const FeatureSelector: React.FC<Props> = ({ onSubmit }) => {
  const [selected, setSelected] = useState<Set<Feature>>(
    new Set(FEATURES.filter((f) => f.recommended).map((f) => f.key))
  );
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(Math.max(0, cursor - 1));
    } else if (key.downArrow) {
      setCursor(Math.min(FEATURES.length - 1, cursor + 1));
    } else if (input === ' ') {
      const feature = FEATURES[cursor].key;
      const newSelected = new Set(selected);
      if (newSelected.has(feature)) {
        newSelected.delete(feature);
      } else {
        newSelected.add(feature);
      }
      setSelected(newSelected);
    } else if (key.return) {
      if (selected.size > 0) {
        onSubmit(Array.from(selected));
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        Select features to include (Space to toggle, Enter to confirm):
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {FEATURES.map((feature, index) => {
          const isSelected = selected.has(feature.key);
          const isCursor = cursor === index;
          return (
            <Box key={feature.key}>
              <Text color={isCursor ? 'cyan' : undefined}>
                {isCursor ? '❯ ' : '  '}
                {isSelected ? '✅ ' : '◯ '}
                {feature.label}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          {selected.size} feature{selected.size !== 1 ? 's' : ''} selected
        </Text>
      </Box>
    </Box>
  );
};

