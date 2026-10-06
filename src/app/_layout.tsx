import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors, Fonts } from '@/constants/theme';
import { AuthProvider } from '@/lib/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerTitleStyle: { fontFamily: Fonts.serif, fontSize: 18 },
              headerTintColor: palette.text,
              headerShadowVisible: false,
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="session/[id]" options={{ title: 'Session' }} />
            <Stack.Screen name="session/book" options={{ title: 'Reserve a Time', presentation: 'modal' }} />
            <Stack.Screen name="gallery/[id]" options={{ title: 'Proofs' }} />
            <Stack.Screen
              name="proof/[id]"
              options={{ title: '', presentation: 'fullScreenModal', headerShown: false }}
            />
            <Stack.Screen name="order" options={{ title: 'Order Prints', presentation: 'modal' }} />
            <Stack.Screen name="login" options={{ title: 'Client Sign In', presentation: 'modal' }} />
            <Stack.Screen name="about" options={{ title: 'About DuBose' }} />
            <Stack.Screen name="pricing" options={{ title: 'Sessions & Pricing' }} />
            <Stack.Screen name="hostess" options={{ title: 'Host a Session' }} />
            <Stack.Screen name="contact" options={{ title: 'Contact' }} />
            <Stack.Screen name="payments" options={{ title: 'Payments' }} />
            <Stack.Screen name="my-bookings" options={{ title: 'My Reservations' }} />
          </Stack>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
