import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import type { PortfolioImage } from '@/lib/types';

type Category = 'all' | PortfolioImage['category'];
const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'single', label: 'Single Images' },
  { key: 'composite', label: 'Composites' },
  { key: 'siblings', label: 'Siblings' },
];

export default function PortfolioScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<Category>('all');
  const [selected, setSelected] = useState<PortfolioImage | null>(null);
  const portfolio = useAsync(() => api.listPortfolio(), []);

  const columns = width >= 600 ? 3 : 2;
  const contentWidth = Math.min(width, MaxContentWidth) - Spacing.md * 2;
  const tile = (contentWidth - Spacing.sm * (columns - 1)) / columns;
  const images = (portfolio.data ?? []).filter((i) => category === 'all' || i.category === category);

  return (
    <Screen refreshing={false} onRefresh={portfolio.refresh}>
      <AppText color="textSecondary" style={styles.intro}>
        Classic black and white vignetted portraits, in the style created in the earliest days of photography.
      </AppText>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setCategory(c.key)}
              style={[
                styles.chip,
                { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface },
              ]}>
              <AppText variant="caption" style={{ color: active ? theme.accentText : theme.text, fontWeight: '600' }}>
                {c.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {portfolio.loading ? (
        <Loading />
      ) : images.length === 0 ? (
        <EmptyState icon="images-outline" title="No images yet" body="Portfolio images will appear here once the studio publishes them." />
      ) : (
        <View style={styles.grid}>
          {images.map((img) => (
            <Pressable
              key={img.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={img.caption ?? 'Portrait'}
              onPress={() => setSelected(img)}
              style={[styles.tile, { width: tile, height: tile * 1.33, backgroundColor: theme.surfaceAlt }]}>
              <Image source={{ uri: img.url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            </Pressable>
          ))}
        </View>
      )}

      <Modal visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.viewer}>
          {selected ? (
            <Image source={{ uri: selected.url }} style={StyleSheet.absoluteFill} contentFit="contain" transition={200} />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => setSelected(null)}
            style={[styles.close, { top: insets.top + Spacing.sm }]}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          {selected?.caption ? (
            <View style={[styles.captionBar, { paddingBottom: insets.bottom + Spacing.md }]}>
              <AppText center style={styles.captionText}>
                {selected.caption}
              </AppText>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tile: { borderRadius: Radius.sm, overflow: 'hidden' },
  viewer: { flex: 1, backgroundColor: '#000000' },
  close: { position: 'absolute', right: Spacing.md, padding: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 999 },
  captionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.md, backgroundColor: 'rgba(0,0,0,0.5)' },
  captionText: { color: '#FFFFFF' },
});
