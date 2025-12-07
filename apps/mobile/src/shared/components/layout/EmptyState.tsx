import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-2xl font-bold text-gray-800 mb-2">{title}</Text>
      {description && (
        <Text className="text-gray-600 text-center mb-4">{description}</Text>
      )}
      {action}
    </View>
  );
}
