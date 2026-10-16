import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { About, Studio } from '@/lib/content';
import { studioPhoto } from '@/lib/studio-photos';

export default function AboutScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View style={[styles.portrait, { backgroundColor: theme.surfaceAlt }]}>
        <Image
          source={{ uri: studioPhoto('photographer', 800, 800) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          accessibilityLabel={`${Studio.photographer} holding a young client`}
        />
      </View>
      <AppText variant="eyebrow">Since 1994</AppText>
      <AppText variant="title" style={styles.title}>
        {Studio.photographer}
      </AppText>
      {About.paragraphs.map((p, i) => (
        <AppText key={i} style={styles.paragraph}>
          {p}
        </AppText>
      ))}
      <View style={styles.actions}>
        <Button title="See the gallery" onPress={() => router.push('/portfolio')} />
        <Button title="Reserve a session" variant="secondary" onPress={() => router.push('/sessions')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  portrait: { aspectRatio: 1, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg },
  title: { marginBottom: Spacing.md },
  paragraph: { marginBottom: Spacing.md },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
});
