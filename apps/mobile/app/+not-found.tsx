import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-2xl font-bold">404</Text>
        <Text className="text-gray-600 mt-2">This screen doesn't exist.</Text>
      </View>
    </>
  );
}
