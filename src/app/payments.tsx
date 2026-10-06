import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PaymentsInfo, Studio } from '@/lib/content';

const METHODS: { icon: keyof typeof Ionicons.glyphMap; label: string; accepted: boolean }[] = [
  { icon: 'phone-portrait-outline', label: 'Venmo', accepted: true },
  { icon: 'cash-outline', label: 'Cash', accepted: true },
  { icon: 'document-text-outline', label: 'Check', accepted: true },
  { icon: 'card-outline', label: 'Credit or debit card', accepted: false },
  { icon: 'logo-paypal', label: 'PayPal', accepted: false },
];

export default function PaymentsScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <AppText variant="title">{PaymentsInfo.heading}</AppText>
      {PaymentsInfo.paragraphs.map((p, i) => (
        <AppText key={i} color="textSecondary" style={styles.paragraph}>
          {p}
        </AppText>
      ))}
      <Card padded={false}>
        {METHODS.map((m, i) => (
          <View
            key={m.label}
            style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <Ionicons name={m.icon} size={22} color={m.accepted ? theme.accent : theme.textMuted} />
            <AppText style={styles.rowText} color={m.accepted ? 'text' : 'textMuted'}>
              {m.label}
            </AppText>
            <Ionicons
              name={m.accepted ? 'checkmark-circle' : 'close-circle-outline'}
              size={20}
              color={m.accepted ? theme.success : theme.textMuted}
            />
          </View>
        ))}
      </Card>
      <AppText variant="caption">
        Questions about an invoice? Email {Studio.email} or call {Studio.phone}.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  paragraph: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowText: { flex: 1 },
});
