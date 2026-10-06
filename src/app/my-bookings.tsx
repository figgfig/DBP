import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, formatTime } from '@/lib/format';

const STATUS_LABEL = { requested: 'Awaiting hostess confirmation', confirmed: 'Confirmed', cancelled: 'Cancelled' } as const;

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const bookings = useAsync(() => api.listMyBookings(), [user?.id]);

  useFocusEffect(
    useCallback(() => {
      bookings.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  if (api.providerName !== 'demo' && !user) {
    return (
      <Screen>
        <EmptyState icon="lock-closed-outline" title="Sign in to see your reservations" actionLabel="Sign in" onAction={() => router.push('/login')} />
      </Screen>
    );
  }

  return (
    <Screen refreshing={false} onRefresh={bookings.refresh}>
      {bookings.loading && !bookings.data ? (
        <Loading />
      ) : (bookings.data ?? []).length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No reservations yet"
          body="When you request a time at a session it will show up here."
          actionLabel="See the calendar"
          onAction={() => router.push('/sessions')}
        />
      ) : (
        (bookings.data ?? []).map((b) => (
          <Card key={b.id} onPress={() => router.push({ pathname: '/session/[id]', params: { id: b.sessionId } })}>
            <AppText variant="eyebrow">{b.session ? formatDate(b.session.startDate, { weekday: true }) : 'Session'}</AppText>
            <AppText variant="heading">{b.session ? `${b.session.city}, ${b.session.state}` : 'Photo session'}</AppText>
            <AppText color="textSecondary">
              {b.timeSlot ? `${formatTime(b.timeSlot.startsAt)} · ` : 'Waitlist · '}
              {b.children.map((c) => c.name).join(', ')}
            </AppText>
            <View style={styles.status}>
              <AppText variant="caption" color={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'accent'}>
                {STATUS_LABEL[b.status]}
              </AppText>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
});
