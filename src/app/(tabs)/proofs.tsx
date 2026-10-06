import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Studio } from '@/lib/content';
import { formatDate } from '@/lib/format';

export default function ProofsScreen() {
  const theme = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const galleries = useAsync(async () => (user ? api.listGalleries() : []), [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user) galleries.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])
  );

  if (authLoading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <EmptyState
          icon="lock-closed-outline"
          title="Your proofs, in your pocket"
          body="Sign in with the email address you gave at your session. Proofs are posted about four to five weeks after your photo session."
          actionLabel="Sign in"
          onAction={() => router.push('/login')}
        />
        <Card>
          <AppText variant="subheading">Questions about your proofs?</AppText>
          <AppText color="textSecondary" style={styles.cardBody}>
            Email {Studio.email} or call {Studio.phone}.
          </AppText>
          <Button title="Contact the studio" variant="secondary" onPress={() => router.push('/contact')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen refreshing={false} onRefresh={galleries.refresh}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="eyebrow">Signed in as</AppText>
          <AppText variant="label" numberOfLines={1}>
            {user.email}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/my-bookings')} hitSlop={8}>
          <AppText variant="label" color="accent">
            Reservations
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={signOut} hitSlop={8}>
          <AppText variant="label" color="accent">
            Sign out
          </AppText>
        </Pressable>
      </View>

      {galleries.loading ? (
        <Loading />
      ) : galleries.error ? (
        <EmptyState icon="cloud-offline-outline" title="Could not load proofs" body={galleries.error} actionLabel="Try again" onAction={galleries.refresh} />
      ) : (galleries.data ?? []).length === 0 ? (
        <EmptyState
          icon="hourglass-outline"
          title="No proofs yet"
          body="Proofs are posted about four to five weeks after your session. We'll email you when they're ready."
        />
      ) : (
        (galleries.data ?? []).map((g) => (
          <Card
            key={g.id}
            padded={false}
            onPress={() => router.push({ pathname: '/gallery/[id]', params: { id: g.id } })}
            accessibilityLabel={`${g.title}, ${g.proofCount} proofs`}>
            <View style={styles.galleryRow}>
              <View style={[styles.cover, { backgroundColor: theme.surfaceAlt }]}>
                {g.coverUrl ? <Image source={{ uri: g.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
              </View>
              <View style={styles.galleryText}>
                <AppText variant="heading">{g.title}</AppText>
                <AppText variant="caption">Session {formatDate(g.sessionDate)}</AppText>
                <AppText variant="caption">{g.proofCount} proofs</AppText>
                {g.orderBy ? (
                  <AppText variant="caption" color="accent">
                    Order by {formatDate(g.orderBy)}
                  </AppText>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} style={styles.chevron} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  headerText: { flex: 1 },
  cardBody: { marginVertical: Spacing.sm },
  galleryRow: { flexDirection: 'row', alignItems: 'center' },
  cover: { width: 96, height: 128 },
  galleryText: { flex: 1, padding: Spacing.md, gap: 2 },
  chevron: { marginRight: Spacing.md },
});
