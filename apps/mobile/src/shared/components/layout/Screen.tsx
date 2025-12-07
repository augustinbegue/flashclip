import { SafeAreaView, ScrollView, View } from 'react-native';
import type { ViewProps } from 'react-native';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  className,
  ...props
}: ScreenProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1">
      <Container
        className={`flex-1 bg-gray-50 ${className || ''}`}
        {...props}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
