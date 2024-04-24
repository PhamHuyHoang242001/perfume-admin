import { TextInput, TextInputProps } from '@mantine/core';

const NumberInput = (props: TextInputProps) => {
  return (
    <TextInput
      onKeyDown={(e) =>
        e.key === '-' || e.key === 'e' ? e.preventDefault() : null
      }
      {...props}
    />
  );
};

export default NumberInput;
