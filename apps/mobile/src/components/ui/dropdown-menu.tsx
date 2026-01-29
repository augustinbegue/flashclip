import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

// Simple dropdown menu implementation for React Native
export function DropdownMenu({ children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return <View {...props}>{children}</View>;
}

export function DropdownMenuTrigger({ children, asChild, ...props }: ViewProps & { children?: React.ReactNode; asChild?: boolean }) {
  return <View {...props}>{children}</View>;
}

export function DropdownMenuContent({ children, className, ...props }: ViewProps & { children?: React.ReactNode; className?: string }) {
  return (
    <View
      className={cn('mt-2 bg-card border border-border rounded-md shadow-lg shadow-foreground/10', className)}
      {...props}
    >
      {children}
    </View>
  );
}

export function DropdownMenuItem({ children, className, onPress, ...props }: ViewProps & { children?: React.ReactNode; className?: string; onPress?: () => void }) {
  return (
    <View
      className={cn('px-4 py-2 border-b border-border', className)}
      {...props}
    >
      {children}
    </View>
  );
}
