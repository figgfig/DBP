import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateRange, formatMoney } from '@/lib/format';
import type { PhotoSession } from '@/lib/types';

import { Card } from './card';
import { StatusBadge } from './status-badge';
import { AppText } from './text';

export function SessionCard({ session }: { session: PhotoSession }) {
  const theme = useTheme();
  const openSlots = session.timeSlots.filter((s) => s.available).length;
  return (
    <Card
      onPress={() => router.push({ pathname: '/session/[id]', params: { id: session.id } })}
      accessibilityLabel={`${session.city}, ${session.state} session on ${formatDateRange(session.startDate, session.endDate)}`}>
      <View style={styles.row}>
        <View style={styles.main}>
          <AppText variant="eyebrow">{formatDateRange(session.startDate, session.endDate)}</AppText>
          <AppText variant="heading">
            {session.city}, {session.state}
          </AppText>
          <AppText variant="caption">
            {formatMoney(session.sittingFee)} sitting fee per child
            {session.status === 'open' && openSlots > 0 ? ` · ${openSlots} times open` : ''}
          </AppText>
          <View style={styles.badge}>
            <StatusBadge status={session.status} />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  main: { flex: 1, gap: 2 },
  badge: { marginTop: Spacing.xs },
});
