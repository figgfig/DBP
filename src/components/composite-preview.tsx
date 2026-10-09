import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import type { CompositeTemplate } from '@/lib/composites';

const OVAL_MASK = require('@/assets/images/vignette-oval.png');
const RECT_MASK = require('@/assets/images/vignette-rect.png');

interface CompositePreviewProps {
  template: CompositeTemplate;
  /** Image URL for each filled slot, keyed by slot id. */
  images: Record<string, string | undefined>;
  width: number;
  activeSlotId?: string;
  onSlotPress?: (slotId: string) => void;
  /** Show numbered empty slots. Turn off for small thumbnails. */
  showSlotNumbers?: boolean;
}

/**
 * Draws a composite: a paper background with each photo inside a soft
 * vignette. The mask image is paper-colored at the edges and clear in the
 * middle, so it fades each photo into the paper like the printed composites.
 */
export function CompositePreview({
  template,
  images,
  width,
  activeSlotId,
  onSlotPress,
  showSlotNumbers = true,
}: CompositePreviewProps) {
  const theme = useTheme();
  const height = width / template.aspectRatio;
  const paper = template.background ?? '#FFFFFF';

  return (
    <View
      style={[styles.canvas, { width, height, backgroundColor: paper, borderColor: theme.border }]}
      accessibilityLabel={`${template.name} composite preview`}>
      {template.slots.map((slot, index) => {
        const uri = images[slot.id];
        const active = slot.id === activeSlotId;
        const frame = {
          left: slot.x * width,
          top: slot.y * height,
          width: slot.w * width,
          height: slot.h * height,
        };
        const content = (
          <>
            {uri ? (
              <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.empty, { backgroundColor: '#E9E5DE' }]}>
                {showSlotNumbers ? (
                  <>
                    <Ionicons name="add" size={Math.min(28, frame.width / 3)} color="#8A847A" />
                    <AppText variant="caption" style={styles.emptyText}>
                      {index + 1}
                    </AppText>
                  </>
                ) : null}
              </View>
            )}
            <Image
              source={slot.shape === 'rect' ? RECT_MASK : OVAL_MASK}
              style={StyleSheet.absoluteFill}
              contentFit="fill"
              tintColor={paper}
            />
            {active ? (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.activeRing,
                  { borderColor: theme.accent, borderRadius: slot.shape === 'rect' ? 6 : 9999 },
                ]}
              />
            ) : null}
          </>
        );
        return onSlotPress ? (
          <Pressable
            key={slot.id}
            accessibilityRole="button"
            accessibilityLabel={`Photo ${index + 1}${uri ? ', filled' : ', empty'}`}
            accessibilityState={{ selected: active }}
            onPress={() => onSlotPress(slot.id)}
            style={[styles.slot, frame]}>
            {content}
          </Pressable>
        ) : (
          <View key={slot.id} style={[styles.slot, frame]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  slot: { position: 'absolute', overflow: 'hidden' },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8A847A', fontWeight: '600' },
  activeRing: { borderWidth: 3 },
});
