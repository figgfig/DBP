import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, formatMoney, formatTime, isValidEmail } from '@/lib/format';

type Child = { name: string; age: string };

export default function BookScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { sessionId, slotId } = useLocalSearchParams<{ sessionId: string; slotId?: string }>();
  const session = useAsync(() => api.getSession(sessionId), [sessionId]);

  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(slotId);
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [children, setChildren] = useState<Child[]>([{ name: '', age: '' }]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const s = session.data;
  const openSlots = s?.timeSlots.filter((t) => t.available) ?? [];
  const slot = s?.timeSlots.find((t) => t.id === selectedSlot);
  const isWaitlist = !!s && (s.status === 'waitlist' || openSlots.length === 0);

  function validate() {
    const next: Record<string, string> = {};
    if (!parentName.trim()) next.parentName = 'Please enter your name.';
    if (!isValidEmail(email)) next.email = 'Please enter a valid email address.';
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a phone number with area code.';
    if (!children.some((c) => c.name.trim())) next.children = 'Add at least one child.';
    if (!isWaitlist && !selectedSlot) next.slot = 'Choose a time.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!s || !validate()) return;
    setSubmitting(true);
    try {
      await api.requestBooking({
        sessionId: s.id,
        timeSlotId: isWaitlist ? undefined : selectedSlot,
        parentName: parentName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        children: children.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), age: c.age.trim() })),
        notes: notes.trim() || undefined,
      });
      Alert.alert(
        isWaitlist ? 'You’re on the list' : 'Request sent',
        isWaitlist
          ? 'The hostess will reach out if a time opens up.'
          : `The hostess will confirm your ${slot ? formatTime(slot.startsAt) : ''} time by email. The ${formatMoney(
              s.sittingFee
            )} sitting fee per child is paid at the session.`,
        [{ text: 'OK', onPress: () => router.dismissAll() }]
      );
    } catch (e) {
      Alert.alert('Could not send request', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (session.loading || !s) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="eyebrow">{formatDate(s.startDate, { weekday: true })}</AppText>
      <AppText variant="title" style={styles.title}>
        {s.city}, {s.state}
      </AppText>

      {!isWaitlist ? (
        <Card>
          <AppText variant="label" style={styles.fieldLabel}>
            Time
          </AppText>
          <View style={styles.slotGrid}>
            {openSlots.map((t) => {
              const active = t.id === selectedSlot;
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelectedSlot(t.id)}
                  style={[
                    styles.slot,
                    { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface },
                  ]}>
                  <AppText variant="caption" style={{ color: active ? theme.accentText : theme.text, fontWeight: '600' }}>
                    {s.startDate !== s.endDate ? `${formatDate(t.startsAt, { year: false })} ` : ''}
                    {formatTime(t.startsAt)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.slot ? (
            <AppText variant="caption" color="danger" style={styles.error}>
              {errors.slot}
            </AppText>
          ) : null}
        </Card>
      ) : (
        <Card>
          <AppText color="textSecondary">All times are reserved. Submit your details to join the waitlist.</AppText>
        </Card>
      )}

      <TextField label="Parent name" value={parentName} onChangeText={setParentName} autoCapitalize="words" error={errors.parentName} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={errors.email}
        hint="Your proofs will be sent to this address."
      />
      <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />

      <AppText variant="label" style={styles.fieldLabel}>
        Children being photographed
      </AppText>
      {children.map((child, i) => (
        <View key={i} style={styles.childRow}>
          <View style={styles.childName}>
            <TextField
              label={`Child ${i + 1} name`}
              value={child.name}
              onChangeText={(v) => setChildren((prev) => prev.map((c, j) => (j === i ? { ...c, name: v } : c)))}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.childAge}>
            <TextField
              label="Age"
              value={child.age}
              onChangeText={(v) => setChildren((prev) => prev.map((c, j) => (j === i ? { ...c, age: v } : c)))}
              keyboardType="number-pad"
            />
          </View>
          {children.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove child ${i + 1}`}
              onPress={() => setChildren((prev) => prev.filter((_, j) => j !== i))}
              style={styles.remove}>
              <Ionicons name="close-circle" size={24} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
      ))}
      {errors.children ? (
        <AppText variant="caption" color="danger" style={styles.error}>
          {errors.children}
        </AppText>
      ) : null}
      <Button title="Add another child" variant="ghost" onPress={() => setChildren((prev) => [...prev, { name: '', age: '' }])} />

      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Anything the hostess should know" />

      <Card>
        <AppText variant="caption">
          Sitting fee: {formatMoney(s.sittingFee)} per child, non-refundable, paid at the session by Venmo, cash, or check and applied to
          each child’s order (minimum {formatMoney(s.minimumOrder)} per child).
        </AppText>
      </Card>

      <Button title={isWaitlist ? 'Join the waitlist' : 'Send request'} onPress={submit} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: Spacing.md },
  fieldLabel: { marginBottom: Spacing.sm },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  error: { marginTop: Spacing.xs, marginBottom: Spacing.sm },
  childRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  childName: { flex: 1 },
  childAge: { width: 80 },
  remove: { paddingTop: 36 },
});
