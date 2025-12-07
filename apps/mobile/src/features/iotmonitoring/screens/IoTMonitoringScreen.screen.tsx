import { View } from 'react-native';
import { Screen } from '@/shared/components/layout/Screen';
import { useIotmonitoringController } from '../controllers/iotmonitoring.controller';

export default function IoTMonitoringScreenScreen() {
  const controller = useIotmonitoringController();

  return (
    <Screen scrollable>
      {/* TODO: Implement screen content for IoTMonitoringScreen */}
    </Screen>
  );
}
