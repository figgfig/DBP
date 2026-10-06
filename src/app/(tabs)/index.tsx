import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { SessionCard } from '@/components/session-card';
import { AppText } from '@/components/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { About, Studio } from '@/lib/content';
import { isUpcoming } from '@/lib/format';

const QUICK_LINKS: { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; href: Href }[] = [
  { title: 'My Proofs', subtitle: 'View and favorite your images', icon: 'albums-outline', href: '/proofs' },
  { title: 'Reserve a Session', subtitle: 'Spring & Fall travel dates', icon: 'calendar-outline', href: '/sessions' },
  { title: 'Host a Session', subtitle: 'Bring DuBose to your city', icon: 'people-outline', href: '/hostess' },
  { title: 'Sessions & Pricing', subtitle: 'Sitting fees and proofs', icon: 'pricetag-outline', href: '/pricing' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const sessions = useAsync(() => api.listSessions(), []);
  const upcoming = (sessions.data ?? []).filter((s) => s.status !== 'past' && isUpcoming(s.endDate)).slice(0, 3);

  return (
    <Screen padded={false} refreshing={false} onRefresh={sessions.refresh}>
      <View style={[styles.hero, { paddingTop: insets.top + Spacing.xl, backgroundColor: '#161412' }]}>
        <Image
          source={{ uri: 'https://picsum.photos/seed/dbp-hero/900/1200?grayscale' }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <AppText variant="eyebrow" style={styles.heroEyebrow}>
            Charleston, South Carolina
          </AppText>
          <AppText variant="display" style={styles.heroTitle}>
            {Studio.name}
          </AppText>
          <AppText style={styles.heroTagline}>{Studio.tagline}</AppText>
          <View style={styles.heroButtons}>
            <Button title="Reserve a Session" onPress={() => router.push('/sessions')} />
            <Button
              title={user ? 'My Proofs' : 'Client Sign In'}
              variant="secondary"
              onPress={() => router.push(user ? '/proofs' : '/login')}
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.grid}>
          {QUICK_LINKS.map((link) => (
            <Pressable
              key={link.title}
              accessibilityRole="button"
              onPress={() => router.push(link.href)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
              ]}>
              <Ionicons name={link.icon} size={24} color={theme.accent} />
              <AppText variant="label" style={styles.tileTitle}>
                {link.title}
              </AppText>
              <AppText variant="caption">{link.subtitle}</AppText>
            </Pressable>
          ))}
        </View>

        <SectionHeader
          eyebrow="Calendar"
          title="Upcoming sessions"
          actionLabel="See all"
          onAction={() => router.push('/sessions')}
        />
        {sessions.loading ? (
          <Loading />
        ) : upcoming.length === 0 ? (
          <Card>
            <AppText color="textSecondary">
              New Spring and Fall dates are posted here as hostesses confirm them. Check back soon or apply to host a session in your city.
            </AppText>
          </Card>
        ) : (
          upcoming.map((s) => <SessionCard key={s.id} session={s} />)
        )}

        <SectionHeader eyebrow="The Studio" title="About DuBose" actionLabel="Read more" onAction={() => router.push('/about')} />
        <Card onPress={() => router.push('/about')}>
          <AppText color="textSecondary">{About.paragraphs[1]}</AppText>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 440, justifyContent: 'flex-end', overflow: 'hidden' },
  heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14, 12, 10, 0.55)' },
  heroContent: { padding: Spacing.lg, gap: Spacing.sm },
  heroEyebrow: { color: 'rgba(255,255,255,0.75)' },
  heroTitle: { color: '#FFFFFF' },
  heroTagline: { color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.sm },
  heroButtons: { gap: Spacing.sm },
  body: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  tileTitle: { marginTop: Spacing.xs },
});
