import { TextInput, View, Text } from 'react-native';
import type { TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium mb-2">{label}</Text>}
      <TextInput
        className={`border border-gray-300 rounded-lg px-4 py-3 ${error ? 'border-red-500' : ''} ${className || ''}`}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
