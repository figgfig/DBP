import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { StatusBadge } from '@/components/status-badge';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { Studio } from '@/lib/content';
import { formatDate, formatDateRange, formatMoney, formatTime, isUpcoming } from '@/lib/format';

export default function SessionDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAsync(() => api.getSession(id), [id]);
  const s = session.data;

  if (session.loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (!s) {
    return (
      <Screen>
        <EmptyState icon="calendar-outline" title="Session not found" actionLabel="Back to calendar" onAction={() => router.back()} />
      </Screen>
    );
  }

  const upcoming = s.status !== 'past' && isUpcoming(s.endDate);
  const openSlots = s.timeSlots.filter((t) => t.available);
  const byDay = s.timeSlots.reduce<Record<string, typeof s.timeSlots>>((acc, slot) => {
    const day = slot.startsAt.slice(0, 10);
    (acc[day] ??= []).push(slot);
    return acc;
  }, {});
  const canBook = upcoming && (s.status === 'open' || s.status === 'waitlist');

  return (
    <Screen refreshing={false} onRefresh={session.refresh}>
      <Stack.Screen options={{ title: `${s.city}, ${s.state}` }} />
      <AppText variant="eyebrow">{formatDateRange(s.startDate, s.endDate)}</AppText>
      <AppText variant="title">
        {s.city}, {s.state}
      </AppText>
      <View style={styles.badge}>
        <StatusBadge status={s.status} />
      </View>

      <Card>
        <Row icon="cash-outline" label="Sitting fee" value={`${formatMoney(s.sittingFee)} per child, non-refundable`} />
        <Row icon="receipt-outline" label="Minimum order" value={`${formatMoney(s.minimumOrder)} per child. The sitting fee is applied to your order.`} />
        <Row icon="time-outline" label="Session" value="15 minutes per family. Each child is photographed separately." />
        {s.venueName ? <Row icon="location-outline" label="Venue" value={s.venueName} /> : null}
        {s.notes ? <Row icon="information-circle-outline" label="Notes" value={s.notes} /> : null}
      </Card>

      <SectionHeader eyebrow="Your local contact" title={s.hostesses.length > 1 ? 'Hostesses' : 'Hostess'} />
      {s.hostesses.map((h, i) => (
        <Card key={`${h.name}-${i}`}>
          <AppText variant="subheading">{h.name}</AppText>
          <View style={styles.contactRow}>
            {h.email ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`mailto:${h.email}`)} style={styles.contactLink}>
                <Ionicons name="mail-outline" size={18} color={theme.accent} />
                <AppText variant="label" color="accent">
                  {h.email}
                </AppText>
              </Pressable>
            ) : null}
            {h.phone ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`tel:${h.phone}`)} style={styles.contactLink}>
                <Ionicons name="call-outline" size={18} color={theme.accent} />
                <AppText variant="label" color="accent">
                  {h.phone}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ))}

      {upcoming ? (
        <>
          <SectionHeader
            eyebrow="Schedule"
            title={s.status === 'waitlist' ? 'Join the waitlist' : 'Available times'}
          />
          {s.status === 'waitlist' || openSlots.length === 0 ? (
            <Card>
              <AppText color="textSecondary">
                All times are currently reserved. Join the waitlist and the hostess will reach out if a time opens up.
              </AppText>
            </Card>
          ) : (
            Object.entries(byDay).map(([day, slots]) => (
              <Card key={day}>
                <AppText variant="subheading" style={styles.dayTitle}>
                  {formatDate(day, { weekday: true })}
                </AppText>
                <View style={styles.slotGrid}>
                  {slots.map((slot) => (
                    <Pressable
                      key={slot.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${formatTime(slot.startsAt)} ${slot.available ? 'available' : 'reserved'}`}
                      disabled={!slot.available}
                      onPress={() =>
                        router.push({ pathname: '/session/book', params: { sessionId: s.id, slotId: slot.id } })
                      }
                      style={[
                        styles.slot,
                        {
                          borderColor: slot.available ? theme.accent : theme.border,
                          backgroundColor: slot.available ? theme.surface : theme.surfaceAlt,
                          opacity: slot.available ? 1 : 0.5,
                        },
                      ]}>
                      <AppText variant="caption" style={{ color: slot.available ? theme.text : theme.textMuted, fontWeight: '600' }}>
                        {formatTime(slot.startsAt)}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </Card>
            ))
          )}
          {canBook ? (
            <Button
              title={s.status === 'waitlist' || openSlots.length === 0 ? 'Join the waitlist' : 'Request a time'}
              onPress={() => router.push({ pathname: '/session/book', params: { sessionId: s.id } })}
              style={styles.cta}
            />
          ) : null}
          <AppText variant="caption" center style={styles.fine}>
            Your request goes to the hostess, who confirms your time. The sitting fee is paid at the session by Venmo, cash, or check.
          </AppText>
        </>
      ) : (
        <Card>
          <AppText color="textSecondary">
            This session has passed. Proofs were emailed four to five weeks after the session and are available under My Proofs.
            Questions? Email {Studio.email}.
          </AppText>
        </Card>
      )}
    </Screen>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={theme.accent} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <AppText variant="label">{label}</AppText>
        <AppText color="textSecondary">{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  rowIcon: { marginTop: 3 },
  rowText: { flex: 1 },
  contactRow: { marginTop: Spacing.xs, gap: Spacing.xs },
  contactLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: 4 },
  dayTitle: { marginBottom: Spacing.sm },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  cta: { marginTop: Spacing.sm },
  fine: { marginTop: Spacing.md },
});
