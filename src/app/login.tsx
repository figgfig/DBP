import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { Studio } from '@/lib/content';
import { isValidEmail } from '@/lib/format';

/** Passwordless sign in: a one-time code is emailed to the client. */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.sendLoginCode(email);
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (code.trim().length < 4) {
      setError('Enter the code from your email.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.verifyLoginCode(email, code);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">Welcome back</AppText>
      <AppText color="textSecondary" style={styles.intro}>
        Sign in with the email address you gave at your session. We’ll send a one-time code, no password needed.
      </AppText>

      {step === 'email' ? (
        <>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            autoFocus
            error={error ?? undefined}
            onSubmitEditing={sendCode}
            returnKeyType="send"
          />
          <Button title="Email me a code" onPress={sendCode} loading={busy} />
        </>
      ) : (
        <>
          <TextField
            label={`Code sent to ${email}`}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus
            error={error ?? undefined}
            hint={api.providerName === 'demo' ? 'Demo mode: use code 123456.' : 'Check your inbox and spam folder.'}
            onSubmitEditing={verify}
            returnKeyType="done"
          />
          <Button title="Sign in" onPress={verify} loading={busy} />
          <Button title="Use a different email" variant="ghost" onPress={() => setStep('email')} style={styles.secondary} />
        </>
      )}

      <Card style={styles.help}>
        <AppText variant="subheading">Can’t sign in?</AppText>
        <AppText color="textSecondary">
          Proofs are linked to the email you gave at your session. If you used a different address, email {Studio.email} or call{' '}
          {Studio.phone} and we’ll move your gallery.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginVertical: Spacing.md },
  secondary: { marginTop: Spacing.sm },
  help: { marginTop: Spacing.xl },
});
