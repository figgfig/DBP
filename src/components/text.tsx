import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppTextProps = TextProps & {
  variant?: 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label' | 'eyebrow';
  color?: ThemeColor;
  center?: boolean;
};

/** Themed text. Serif faces are used for headings to match the studio's classic look. */
export function AppText({ variant = 'body', color, center, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const defaultColor: ThemeColor = variant === 'caption' || variant === 'eyebrow' ? 'textSecondary' : 'text';
  return (
    <Text
      style={[styles[variant], { color: theme[color ?? defaultColor] }, center && styles.center, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: Fonts.serif, fontSize: 36, lineHeight: 42, fontWeight: '600' },
  title: { fontFamily: Fonts.serif, fontSize: 28, lineHeight: 34, fontWeight: '600' },
  heading: { fontFamily: Fonts.serif, fontSize: 22, lineHeight: 28, fontWeight: '600' },
  subheading: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  eyebrow: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' },
  center: { textAlign: 'center' },
});
