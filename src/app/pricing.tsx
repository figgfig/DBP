import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SessionInfo, SingleImagesInfo } from '@/lib/content';

export default function PricingScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <AppText variant="title">{SessionInfo.heading}</AppText>
      <AppText color="textSecondary" style={styles.intro}>
        {SessionInfo.intro}
      </AppText>

      {SessionInfo.points.map((point) => (
        <Card key={point.title}>
          <AppText variant="subheading">{point.title}</AppText>
          <AppText color="textSecondary" style={styles.cardBody}>
            {point.body}
          </AppText>
        </Card>
      ))}

      <SectionHeader eyebrow="Before your session" title="What to expect" />
      <Card>
        {SessionInfo.whatToExpect.map((tip, i) => (
          <View key={i} style={styles.tip}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.accent} />
            <AppText style={styles.tipText}>{tip}</AppText>
          </View>
        ))}
      </Card>

      <SectionHeader eyebrow="Prints" title={SingleImagesInfo.heading} />
      <Card>
        {SingleImagesInfo.paragraphs.map((p, i) => (
          <AppText key={i} color="textSecondary" style={i < SingleImagesInfo.paragraphs.length - 1 && styles.cardBody}>
            {p}
          </AppText>
        ))}
      </Card>

      <Button title="See upcoming sessions" onPress={() => router.push('/sessions')} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginVertical: Spacing.md },
  cardBody: { marginTop: Spacing.xs },
  tip: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  tipText: { flex: 1 },
  cta: { marginTop: Spacing.md },
});
