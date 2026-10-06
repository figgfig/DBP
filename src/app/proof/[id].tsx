import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Loading } from '@/components/loading';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Proof } from '@/lib/types';

/** Full-screen, swipeable proof viewer with a favorite toggle. */
export default function ProofViewerScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { galleryId, index } = useLocalSearchParams<{ id: string; galleryId: string; index?: string }>();
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [current, setCurrent] = useState(Number(index ?? 0));
  const listRef = useRef<FlatList<Proof>>(null);

  useEffect(() => {
    api.listProofs(galleryId).then(setProofs);
  }, [galleryId]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<Proof>[] }) => {
    const first = viewableItems[0];
    if (first && typeof first.index === 'number') setCurrent(first.index);
  }, []);

  async function toggleFavorite() {
    if (!proofs) return;
    const proof = proofs[current];
    const next = !proof.isFavorite;
    setProofs((prev) => prev?.map((p) => (p.id === proof.id ? { ...p, isFavorite: next } : p)) ?? null);
    try {
      await api.setFavorite(proof.id, next);
    } catch {
      setProofs((prev) => prev?.map((p) => (p.id === proof.id ? { ...p, isFavorite: !next } : p)) ?? null);
    }
  }

  const proof = proofs?.[current];

  return (
    <View style={styles.root}>
      {!proofs ? (
        <Loading />
      ) : (
        <FlatList
          ref={listRef}
          data={proofs}
          horizontal
          pagingEnabled
          initialScrollIndex={Math.min(current, proofs.length - 1)}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <View style={{ width, height }}>
              <Image
                source={{ uri: item.fullUrl }}
                placeholder={{ uri: item.thumbnailUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                transition={200}
                accessibilityLabel={`Proof ${item.label}`}
              />
            </View>
          )}
        />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        {proof ? (
          <AppText variant="label" style={styles.label}>
            {proof.label} · {current + 1} of {proofs?.length}
          </AppText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={proof?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={toggleFavorite}
          style={styles.iconButton}>
          <Ionicons name={proof?.isFavorite ? 'heart' : 'heart-outline'} size={26} color={proof?.isFavorite ? '#E0788F' : '#FFFFFF'} />
        </Pressable>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <AppText variant="caption" style={styles.notice} center>
          Proofs are for selection only and are not for reproduction. Swipe to browse.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  iconButton: { padding: Spacing.sm },
  label: { color: '#FFFFFF' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.md, backgroundColor: 'rgba(0,0,0,0.35)', paddingTop: Spacing.sm },
  notice: { color: 'rgba(255,255,255,0.8)' },
});
