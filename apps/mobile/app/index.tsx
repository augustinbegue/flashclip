import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to first tab or main screen
  return <Redirect href="/(tabs)" />;
}
