import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SessionStatus } from '@/lib/types';

import { AppText } from './text';

const LABELS: Record<SessionStatus, string> = {
  open: 'Booking open',
  waitlist: 'Waitlist',
  full: 'Full',
  past: 'Past',
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  const theme = useTheme();
  const color = status === 'open' ? theme.success : status === 'waitlist' ? theme.accent : theme.textMuted;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <AppText variant="caption" style={{ color, fontWeight: '600' }}>
        {LABELS[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
});
