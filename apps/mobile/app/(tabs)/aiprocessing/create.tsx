import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Screen } from '@/shared/components/layout/Screen';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function AIProcessingCreateScreenScreen() {
    // Detail screen
  const isLoading = false;
  const data = null; // TODO: Fetch data using controller

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <EmptyState
          title="Not found"
          description="The requested item could not be found"
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">{data.title || data.name}</Text>
        <Card>
          <Text>TODO: Render details</Text>
        </Card>
      </View>
    </Screen>
  );
  }
