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
import { CompositePricing, PackageRules, Packages, SessionInfo, SingleImagesInfo, SinglePricing } from '@/lib/content';
import { formatMoney } from '@/lib/format';

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

      <SectionHeader eyebrow="Print prices" title="Packages" />
      <Card>
        {Packages.map((pkg, i) => (
          <View key={pkg.id} style={[styles.priceRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <View style={styles.flex}>
              <AppText variant="subheading">{pkg.name}</AppText>
              <AppText color="textSecondary">{pkg.summary}</AppText>
            </View>
            <AppText variant="subheading">{formatMoney(pkg.price)}</AppText>
          </View>
        ))}
        <AppText variant="caption" style={styles.cardBody}>
          {PackageRules}
        </AppText>
      </Card>

      <SectionHeader eyebrow="Print prices" title="Composites" />
      <Card>
        {Object.entries(CompositePricing.prices).map(([size, price], i) => (
          <View key={size} style={[styles.priceRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <AppText style={styles.flex}>{size} paper</AppText>
            <AppText variant="subheading">{formatMoney(price)}</AppText>
          </View>
        ))}
        {CompositePricing.notes.map((n) => (
          <AppText key={n} variant="caption" style={styles.cardBody}>
            {n}
          </AppText>
        ))}
      </Card>

      <SectionHeader eyebrow="Print prices" title="Single images" />
      {SinglePricing.rows.map((row) => (
        <Card key={row.label}>
          <AppText variant="subheading">{row.label}</AppText>
          {SinglePricing.sizes.map((size, i) =>
            row.prices[i] == null ? null : (
              <View key={size} style={styles.priceRowTight}>
                <AppText color="textSecondary" style={styles.flex}>
                  {size}
                </AppText>
                <AppText>{formatMoney(row.prices[i] as number)}</AppText>
              </View>
            )
          )}
        </Card>
      ))}
      {SinglePricing.notes.map((n) => (
        <AppText key={n} variant="caption" style={styles.cardBody}>
          {n}
        </AppText>
      ))}

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
  flex: { flex: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  priceRowTight: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
});
