import { View, ActivityIndicator } from 'react-native';

interface LoadingProps {
  fullscreen?: boolean;
}

export function Loading({ fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <ActivityIndicator size="small" color="#3B82F6" />;
}
