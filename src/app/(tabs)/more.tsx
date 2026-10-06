import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Studio } from '@/lib/content';

type Row = { title: string; icon: keyof typeof Ionicons.glyphMap; href?: Href; url?: string };

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'The Studio',
    rows: [
      { title: 'About DuBose', icon: 'person-outline', href: '/about' },
      { title: 'Sessions & Pricing', icon: 'pricetag-outline', href: '/pricing' },
      { title: 'Payments', icon: 'cash-outline', href: '/payments' },
      { title: 'Contact', icon: 'call-outline', href: '/contact' },
    ],
  },
  {
    title: 'Get Involved',
    rows: [
      { title: 'Host a Session', icon: 'people-outline', href: '/hostess' },
      { title: 'My Reservations', icon: 'bookmark-outline', href: '/my-bookings' },
    ],
  },
  {
    title: 'Online',
    rows: [
      { title: 'Website', icon: 'globe-outline', url: Studio.website },
      { title: 'Blog', icon: 'newspaper-outline', url: Studio.blogUrl },
      { title: 'Facebook', icon: 'logo-facebook', url: Studio.facebookUrl },
    ],
  },
];

export default function MoreScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen>
      {SECTIONS.map((section) => (
        <View key={section.title}>
          <AppText variant="eyebrow" style={styles.sectionTitle}>
            {section.title}
          </AppText>
          <Card padded={false}>
            {section.rows.map((row, index) => (
              <Pressable
                key={row.title}
                accessibilityRole="button"
                onPress={() => {
                  if (row.href) router.push(row.href);
                  else if (row.url) WebBrowser.openBrowserAsync(row.url).catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
                  pressed && { backgroundColor: theme.surfaceAlt },
                ]}>
                <Ionicons name={row.icon} size={22} color={theme.accent} />
                <AppText style={styles.rowTitle}>{row.title}</AppText>
                <Ionicons name={row.url ? 'open-outline' : 'chevron-forward'} size={18} color={theme.textMuted} />
              </Pressable>
            ))}
          </Card>
        </View>
      ))}

      <AppText variant="eyebrow" style={styles.sectionTitle}>
        Account
      </AppText>
      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (user ? signOut() : router.push('/login'))}
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name={user ? 'log-out-outline' : 'log-in-outline'} size={22} color={theme.accent} />
          <View style={styles.rowTitle}>
            <AppText>{user ? 'Sign out' : 'Client sign in'}</AppText>
            {user ? <AppText variant="caption">{user.email}</AppText> : null}
          </View>
        </Pressable>
      </Card>

      <AppText variant="caption" center style={styles.footer}>
        {Studio.name} v{version}
        {api.providerName === 'demo' ? ' · Demo data' : ''}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowTitle: { flex: 1 },
  footer: { marginTop: Spacing.lg },
});
