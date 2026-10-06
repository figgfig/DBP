import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';

export default function GalleryScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const gallery = useAsync(() => api.getGallery(id), [id]);
  const proofs = useAsync(() => api.listProofs(id), [id]);

  useFocusEffect(
    useCallback(() => {
      proofs.refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])
  );

  if (!user) {
    return (
      <Screen>
        <EmptyState icon="lock-closed-outline" title="Sign in to view proofs" actionLabel="Sign in" onAction={() => router.replace('/login')} />
      </Screen>
    );
  }

  const columns = width >= 600 ? 4 : 3;
  const contentWidth = Math.min(width, MaxContentWidth) - Spacing.md * 2;
  const tile = (contentWidth - Spacing.sm * (columns - 1)) / columns;
  const list = (proofs.data ?? []).filter((p) => !favoritesOnly || p.isFavorite);
  const favoriteCount = (proofs.data ?? []).filter((p) => p.isFavorite).length;

  return (
    <Screen refreshing={false} onRefresh={proofs.refresh}>
      <Stack.Screen options={{ title: gallery.data?.title ?? 'Proofs' }} />
      {gallery.data ? (
        <Card>
          <AppText variant="caption">Session {formatDate(gallery.data.sessionDate)}</AppText>
          {gallery.data.orderBy ? (
            <AppText variant="label" color="accent">
              Please order by {formatDate(gallery.data.orderBy)}
            </AppText>
          ) : null}
          <AppText color="textSecondary" style={styles.help}>
            Tap a proof to view it full screen. Mark favorites with the heart, then tap Order to send your selections to the studio.
          </AppText>
          <View style={styles.actions}>
            <Button
              title={favoriteCount > 0 ? `Order (${favoriteCount} favorites)` : 'Order prints'}
              onPress={() => router.push({ pathname: '/order', params: { galleryId: id } })}
              style={styles.flex}
            />
            {gallery.data.priceSheetUrl ? (
              <Button title="Price sheet" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(gallery.data!.priceSheetUrl!)} />
            ) : null}
          </View>
        </Card>
      ) : null}

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: favoritesOnly }}
        onPress={() => setFavoritesOnly((v) => !v)}
        style={styles.filter}>
        <Ionicons name={favoritesOnly ? 'heart' : 'heart-outline'} size={18} color={theme.accent} />
        <AppText variant="label" color="accent">
          {favoritesOnly ? 'Showing favorites' : 'Show favorites only'}
        </AppText>
      </Pressable>

      {proofs.loading && !proofs.data ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState icon="heart-outline" title={favoritesOnly ? 'No favorites yet' : 'No proofs in this gallery'} />
      ) : (
        <View style={styles.grid}>
          {list.map((proof, index) => (
            <Pressable
              key={proof.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Proof ${proof.label}${proof.isFavorite ? ', favorite' : ''}`}
              onPress={() => router.push({ pathname: '/proof/[id]', params: { id: proof.id, galleryId: id, index: String(index) } })}
              style={[styles.tile, { width: tile, height: tile * 1.33, backgroundColor: theme.surfaceAlt }]}>
              <Image source={{ uri: proof.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              <View style={styles.labelBar}>
                <AppText variant="caption" style={styles.labelText} numberOfLines={1}>
                  {proof.label}
                </AppText>
                {proof.isFavorite ? <Ionicons name="heart" size={14} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { marginVertical: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  flex: { flex: 1 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: { borderRadius: Radius.sm, overflow: 'hidden' },
  labelBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  labelText: { color: '#FFFFFF', fontWeight: '600' },
});
