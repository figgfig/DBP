import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppText } from '@/components/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { About, Studio } from '@/lib/content';

/** About the studio: the company, its style, and how sessions work. */
export default function AboutScreen() {
  const theme = useTheme();
  const portfolio = useAsync(() => api.listPortfolio(), []);
  const samples = (portfolio.data ?? []).slice(0, 3);

  return (
    <Screen>
      <AppText variant="eyebrow">{About.eyebrow}</AppText>
      <AppText variant="title" style={styles.title}>
        {Studio.name}
      </AppText>
      <AppText style={styles.intro}>{About.intro}</AppText>
      {About.paragraphs.map((p, i) => (
        <AppText key={i} color="textSecondary" style={styles.paragraph}>
          {p}
        </AppText>
      ))}

      {samples.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See the gallery"
          onPress={() => router.push('/portfolio')}
          style={styles.samples}>
          {samples.map((img) => (
            <View key={img.id} style={[styles.sample, { backgroundColor: theme.surfaceAlt }]}>
              <Image source={{ uri: img.url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            </View>
          ))}
        </Pressable>
      ) : null}

      <SectionHeader eyebrow="What we do" title="The DuBose difference" />
      <Card>
        {About.highlights.map((h, i) => (
          <View
            key={h.title}
            style={[styles.highlight, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <Ionicons name={h.icon} size={22} color={theme.accent} style={styles.highlightIcon} />
            <View style={styles.highlightText}>
              <AppText variant="subheading">{h.title}</AppText>
              <AppText color="textSecondary">{h.body}</AppText>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button title="See the gallery" onPress={() => router.push('/portfolio')} />
        <Button title="Reserve a session" variant="secondary" onPress={() => router.push('/sessions')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.md },
  intro: { fontSize: 18, lineHeight: 27, marginBottom: Spacing.md },
  paragraph: { marginBottom: Spacing.md },
  samples: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  sample: { flex: 1, aspectRatio: 3 / 4, borderRadius: Radius.sm, overflow: 'hidden' },
  highlight: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm },
  highlightIcon: { marginTop: 2 },
  highlightText: { flex: 1, gap: 2 },
  actions: { gap: Spacing.sm, marginTop: Spacing.md },
});
