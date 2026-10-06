import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { SessionCard } from '@/components/session-card';
import { AppText } from '@/components/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { Studio } from '@/lib/content';
import { isUpcoming } from '@/lib/format';

type Filter = 'upcoming' | 'past';

export default function SessionsScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const sessions = useAsync(() => api.listSessions(), []);

  const list = (sessions.data ?? []).filter((s) =>
    filter === 'upcoming' ? s.status !== 'past' && isUpcoming(s.endDate) : s.status === 'past' || !isUpcoming(s.endDate)
  );
  const sorted = filter === 'past' ? [...list].reverse() : list;

  return (
    <Screen refreshing={false} onRefresh={sessions.refresh}>
      <AppText color="textSecondary" style={styles.intro}>
        DuBose travels across the Southeast each Spring and Fall. Choose a city to see the hostess, sitting fee, and open times.
      </AppText>

      <View style={[styles.segment, { backgroundColor: theme.surfaceAlt }]}>
        {(['upcoming', 'past'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
            onPress={() => setFilter(f)}
            style={[styles.segmentItem, filter === f && { backgroundColor: theme.surface }]}>
            <AppText variant="label" color={filter === f ? 'text' : 'textSecondary'}>
              {f === 'upcoming' ? 'Upcoming' : 'Past'}
            </AppText>
          </Pressable>
        ))}
      </View>

      {sessions.loading ? (
        <Loading />
      ) : sessions.error ? (
        <EmptyState icon="cloud-offline-outline" title="Could not load sessions" body={sessions.error} actionLabel="Try again" onAction={sessions.refresh} />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={filter === 'upcoming' ? 'No dates posted yet' : 'No past sessions'}
          body={
            filter === 'upcoming'
              ? 'New Spring and Fall dates are added as hostesses confirm them. Want DuBose in your city? Apply to host.'
              : undefined
          }
          actionLabel={filter === 'upcoming' ? 'Host a Session' : undefined}
          onAction={filter === 'upcoming' ? () => router.push('/hostess') : undefined}
        />
      ) : (
        sorted.map((s) => <SessionCard key={s.id} session={s} />)
      )}

      <Card>
        <AppText variant="subheading">Don’t see your city?</AppText>
        <AppText color="textSecondary" style={styles.cardBody}>
          Contact {Studio.representative.name}, the representative for {Studio.representative.states.join(', ')}, at{' '}
          {Studio.representative.phone}, or apply to host a session.
        </AppText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/hostess')}>
          <AppText variant="label" color="accent">
            Apply to host
          </AppText>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: Spacing.md },
  segment: { flexDirection: 'row', padding: 3, borderRadius: Radius.md, marginBottom: Spacing.md },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: Radius.sm },
  cardBody: { marginVertical: Spacing.sm },
});
