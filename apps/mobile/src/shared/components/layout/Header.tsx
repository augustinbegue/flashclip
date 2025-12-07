import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {showBack ? (
        <Pressable onPress={() => router.back()}>
          <Text className="text-blue-600">← Back</Text>
        </Pressable>
      ) : (
        <View />
      )}
      <Text className="text-lg font-semibold">{title}</Text>
      {rightAction || <View />}
    </View>
  );
}
