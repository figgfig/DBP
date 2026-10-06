import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppText } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { HostessInfo, Studio } from '@/lib/content';
import { isValidEmail } from '@/lib/format';
import type { HostessApplication } from '@/lib/types';

const SEASONS: { key: HostessApplication['preferredSeason']; label: string }[] = [
  { key: 'spring', label: 'Spring' },
  { key: 'fall', label: 'Fall' },
  { key: 'either', label: 'Either' },
];

export default function HostessScreen() {
  const theme = useTheme();
  const [form, setForm] = useState<HostessApplication>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    preferredSeason: 'either',
    venueIdea: '',
    estimatedFamilies: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof HostessApplication, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof HostessApplication>(key: K) => (value: HostessApplication[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate() {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a phone number with area code.';
    if (!form.city.trim()) next.city = 'Please enter your city.';
    if (form.state.trim().length !== 2) next.state = 'Use the two-letter state code.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.submitHostessApplication({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        venueIdea: form.venueIdea?.trim() || undefined,
        estimatedFamilies: form.estimatedFamilies?.trim() || undefined,
        message: form.message?.trim() || undefined,
      });
      Alert.alert('Application sent', HostessInfo.nextSteps, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Could not send application', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">{HostessInfo.heading}</AppText>
      <AppText color="textSecondary" style={styles.intro}>
        {HostessInfo.intro}
      </AppText>
      <Card>
        {HostessInfo.benefits.map((b, i) => (
          <View key={i} style={styles.benefit}>
            <Ionicons name="sparkles-outline" size={18} color={theme.accent} />
            <AppText style={styles.benefitText}>{b}</AppText>
          </View>
        ))}
      </Card>

      <Card>
        <AppText variant="subheading">Prefer to talk first?</AppText>
        <AppText color="textSecondary" style={styles.repBody}>
          {Studio.representative.name} represents {Studio.representative.states.join(', ')}.
        </AppText>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`tel:${Studio.representative.phoneDial}`)} style={styles.phone}>
          <Ionicons name="call-outline" size={18} color={theme.accent} />
          <AppText variant="label" color="accent">
            {Studio.representative.phone}
          </AppText>
        </Pressable>
      </Card>

      <SectionHeader eyebrow="Application" title="Tell us about your city" />
      <TextField label="Your name" value={form.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
      <TextField label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
      <TextField label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
      <View style={styles.cityRow}>
        <View style={styles.city}>
          <TextField label="City" value={form.city} onChangeText={set('city')} autoCapitalize="words" error={errors.city} />
        </View>
        <View style={styles.state}>
          <TextField label="State" value={form.state} onChangeText={set('state')} autoCapitalize="characters" maxLength={2} error={errors.state} />
        </View>
      </View>

      <AppText variant="label" style={styles.fieldLabel}>
        Preferred season
      </AppText>
      <View style={styles.seasons}>
        {SEASONS.map((s) => {
          const active = form.preferredSeason === s.key;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => set('preferredSeason')(s.key)}
              style={[styles.season, { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface }]}>
              <AppText variant="label" style={{ color: active ? theme.accentText : theme.text }}>
                {s.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <TextField label="Venue idea (optional)" value={form.venueIdea} onChangeText={set('venueIdea')} placeholder="A home, church hall, club..." />
      <TextField label="Families you could gather (optional)" value={form.estimatedFamilies} onChangeText={set('estimatedFamilies')} keyboardType="number-pad" />
      <TextField label="Anything else? (optional)" value={form.message} onChangeText={set('message')} multiline />

      <Button title="Send application" onPress={submit} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginVertical: Spacing.md },
  benefit: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  benefitText: { flex: 1 },
  repBody: { marginVertical: Spacing.xs },
  phone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: 4 },
  cityRow: { flexDirection: 'row', gap: Spacing.sm },
  city: { flex: 1 },
  state: { width: 90 },
  fieldLabel: { marginBottom: Spacing.sm },
  seasons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  season: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: 999, paddingVertical: 10 },
});
