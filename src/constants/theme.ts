/**
 * DuBose Photography brand theme.
 * The studio's work is classic black-and-white vignetted portraiture, so the
 * palette stays monochrome with warm ivory paper tones and a muted brass accent.
 */
import { Platform } from 'react-native';

export interface Theme {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
  success: string;
  tabBar: string;
}

export const Colors: { light: Theme; dark: Theme } = {
  light: {
    text: '#1C1A17',
    textSecondary: '#6B655C',
    textMuted: '#9A9388',
    background: '#F8F5EF',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEAE1',
    border: '#E2DCD1',
    accent: '#8C6F45',
    accentText: '#FFFFFF',
    danger: '#A4423B',
    success: '#3F6B4A',
    tabBar: '#FFFFFF',
  },
  dark: {
    text: '#F3EFE8',
    textSecondary: '#B8B1A6',
    textMuted: '#857E73',
    background: '#121110',
    surface: '#1C1B19',
    surfaceAlt: '#262421',
    border: '#33302C',
    accent: '#C4A46E',
    accentText: '#121110',
    danger: '#D9736C',
    success: '#7FB88C',
    tabBar: '#1C1B19',
  },
};

export type ThemeColor = keyof Theme;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
  },
  web: {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
  },
})!;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const MaxContentWidth = 720;
