import { View, ScrollView } from 'react-native';
import { Header } from '@/components/ui/header';
import { Text } from '@/components/ui/text';

export default function IndexScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <Header title="Flashclip" />
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Home            </Text>
            <Text className="text-gray-600">
              Welcome to Home screen
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
