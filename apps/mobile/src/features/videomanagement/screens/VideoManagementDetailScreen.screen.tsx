import { View } from 'react-native';
import { Screen } from '@/shared/components/layout/Screen';
import { useVideomanagementController } from '../controllers/videomanagement.controller';

export default function VideoManagementDetailScreenScreen() {
  const controller = useVideomanagementController();

  return (
    <Screen scrollable>
      {/* TODO: Implement screen content for VideoManagementDetailScreen */}
    </Screen>
  );
}
