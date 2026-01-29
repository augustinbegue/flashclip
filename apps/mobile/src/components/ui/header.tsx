import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  return (
    <View className={cn('bg-card border-b border-border py-4 px-6', className)}>
      <Text className="text-2xl font-bold text-center text-card-foreground">
        {title}
      </Text>
    </View>
  );
}
