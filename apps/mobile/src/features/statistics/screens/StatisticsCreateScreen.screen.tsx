import { View } from 'react-native';
import { Screen } from '@/shared/components/layout/Screen';
import { useStatisticsController } from '../controllers/statistics.controller';

export default function StatisticsCreateScreenScreen() {
  const controller = useStatisticsController();

  return (
    <Screen scrollable>
      {/* TODO: Implement screen content for StatisticsCreateScreen */}
    </Screen>
  );
}
