import { Text as RNText } from 'react-native';
import type { TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export function Text({ variant = 'body', className, ...props }: TextProps) {
  const variantStyles = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-600',
  };

  return (
    <RNText
      className={`${variantStyles[variant]} ${className || ''}`}
      {...props}
    />
  );
}
