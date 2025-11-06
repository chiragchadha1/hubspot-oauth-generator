import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface Props {
  label: string;
  defaultValue: string;
  onSubmit: (value: string) => void;
}

export const ProjectInput: React.FC<Props> = ({ label, defaultValue, onSubmit }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Box flexDirection="column">
      <Text bold color="yellow">
        {label}
      </Text>
      <Box>
        <Text dimColor>{'> '}</Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => onSubmit(value)}
        />
      </Box>
    </Box>
  );
};

