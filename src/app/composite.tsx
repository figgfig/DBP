import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/button';
import { CompositePreview } from '@/components/composite-preview';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { cart, useCart } from '@/lib/cart';
import { CompositeTemplates, getTemplate } from '@/lib/composites';
import type { Proof } from '@/lib/types';

let compositeCounter = 0;
function newCompositeId() {
  compositeCounter += 1;
  return `composite-${compositeCounter}-${Math.round(Math.random() * 1e9)}`;
}

/**
 * Composite builder. The client picks a template, taps each spot to choose a
 * proof for it, picks a size and quantity, and adds the composite to the order.
 * Pass `compositeId` to edit a composite already in the order.
 */
export default function CompositeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { galleryId, compositeId } = useLocalSearchParams<{ galleryId: string; compositeId?: string }>();
  const { items } = useCart(galleryId);
  const existing = useMemo(
    () => items.find((i) => i.kind === 'composite' && i.id === compositeId),
    // Only read the existing composite once, when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compositeId]
  );
  const initial = existing?.kind === 'composite' ? existing : undefined;

  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [templateId, setTemplateId] = useState(initial?.templateId ?? CompositeTemplates[0].id);
  const [assigned, setAssigned] = useState<Record<string, string>>(
    () => Object.fromEntries((initial?.slots ?? []).map((s) => [s.slotId, s.proofId]))
  );
  const template = getTemplate(templateId) ?? CompositeTemplates[0];
  const [activeSlot, setActiveSlot] = useState<string>(template.slots[0].id);
  const [size, setSize] = useState(initial?.size ?? template.sizes[Math.min(1, template.sizes.length - 1)]);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [favoritesFirst, setFavoritesFirst] = useState(true);

  useEffect(() => {
    api.listProofs(galleryId).then(setProofs);
  }, [galleryId]);

  const contentWidth = Math.min(width, MaxContentWidth) - Spacing.md * 2;
  const previewWidth = template.aspectRatio < 1 ? Math.min(contentWidth, 320) : contentWidth;
  const proofById = useMemo(() => new Map((proofs ?? []).map((p) => [p.id, p])), [proofs]);
  const images = Object.fromEntries(
    template.slots.map((s) => [s.id, assigned[s.id] ? proofById.get(assigned[s.id])?.thumbnailUrl : undefined])
  );
  const filled = template.slots.filter((s) => assigned[s.id]).length;
  const complete = filled === template.slots.length;
  const activeIndex = template.slots.findIndex((s) => s.id === activeSlot);

  const sortedProofs = useMemo(() => {
    const list = proofs ?? [];
    return favoritesFirst ? [...list].sort((a, b) => Number(!!b.isFavorite) - Number(!!a.isFavorite)) : list;
  }, [proofs, favoritesFirst]);

  function chooseTemplate(id: string) {
    const next = getTemplate(id);
    if (!next) return;
    // Keep chosen photos in order when switching layouts.
    const chosen = template.slots.map((s) => assigned[s.id]).filter(Boolean) as string[];
    setAssigned(Object.fromEntries(next.slots.slice(0, chosen.length).map((s, i) => [s.id, chosen[i]])));
    setTemplateId(id);
    setActiveSlot(next.slots[Math.min(chosen.length, next.slots.length - 1)].id);
    if (!next.sizes.includes(size)) setSize(next.sizes[Math.min(1, next.sizes.length - 1)]);
  }

  function chooseProof(proofId: string) {
    const nextAssigned = { ...assigned, [activeSlot]: proofId };
    setAssigned(nextAssigned);
    // Move to the next empty spot, if any.
    const nextEmpty = template.slots.find((s, i) => i > activeIndex && !nextAssigned[s.id]) ??
      template.slots.find((s) => !nextAssigned[s.id]);
    if (nextEmpty) setActiveSlot(nextEmpty.id);
  }

  function clearSlot() {
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[activeSlot];
      return next;
    });
  }

  function save() {
    if (!complete) return;
    cart.saveComposite(galleryId, {
      kind: 'composite',
      id: initial?.id ?? newCompositeId(),
      templateId: template.id,
      templateName: template.name,
      size,
      quantity,
      slots: template.slots.map((s) => ({
        slotId: s.id,
        proofId: assigned[s.id],
        label: proofById.get(assigned[s.id])?.label ?? '',
      })),
    });
    router.back();
  }

  if (!proofs) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="eyebrow">Step 1 · Layout</AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templates}>
        {CompositeTemplates.map((t) => {
          const active = t.id === template.id;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${t.name}, ${t.slots.length} photos`}
              onPress={() => chooseTemplate(t.id)}
              style={[
                styles.templateCard,
                { borderColor: active ? theme.accent : theme.border, backgroundColor: theme.surface },
              ]}>
              <View style={styles.templateThumb}>
                <CompositePreview template={t} images={{}} width={t.aspectRatio >= 1 ? 96 : 56} showSlotNumbers={false} />
              </View>
              <AppText variant="caption" style={{ color: theme.text, fontWeight: '600' }} numberOfLines={1}>
                {t.name}
              </AppText>
              <AppText variant="caption">{t.slots.length} photos</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      {template.description ? (
        <AppText variant="caption" style={styles.description}>
          {template.description}
        </AppText>
      ) : null}

      <AppText variant="eyebrow" style={styles.step}>
        Step 2 · Photos ({filled} of {template.slots.length})
      </AppText>
      <View style={styles.previewWrap}>
        <CompositePreview
          template={template}
          images={images}
          width={previewWidth}
          activeSlotId={activeSlot}
          onSlotPress={setActiveSlot}
        />
      </View>
      <View style={styles.slotBar}>
        <AppText variant="label" style={styles.flex}>
          Choose a proof for spot {activeIndex + 1}
        </AppText>
        {assigned[activeSlot] ? (
          <Pressable accessibilityRole="button" onPress={clearSlot} hitSlop={8}>
            <AppText variant="label" color="accent">
              Clear
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: favoritesFirst }}
        onPress={() => setFavoritesFirst((v) => !v)}
        style={styles.favToggle}>
        <Ionicons name={favoritesFirst ? 'heart' : 'heart-outline'} size={16} color={theme.accent} />
        <AppText variant="caption" color="accent">
          Favorites first
        </AppText>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {sortedProofs.map((p) => {
          const usedHere = assigned[activeSlot] === p.id;
          const usedElsewhere = !usedHere && Object.values(assigned).includes(p.id);
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Use proof ${p.label}`}
              onPress={() => chooseProof(p.id)}
              style={[
                styles.stripItem,
                { borderColor: usedHere ? theme.accent : 'transparent', backgroundColor: theme.surfaceAlt },
              ]}>
              <Image source={{ uri: p.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={styles.stripLabel}>
                <AppText variant="caption" style={styles.stripLabelText} numberOfLines={1}>
                  {p.label}
                </AppText>
                {p.isFavorite ? <Ionicons name="heart" size={10} color="#FFFFFF" /> : null}
              </View>
              {usedElsewhere ? (
                <View style={styles.usedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <AppText variant="caption" style={styles.hint}>
        The same proof can be used in more than one spot.
      </AppText>

      <AppText variant="eyebrow" style={styles.step}>
        Step 3 · Size
      </AppText>
      <View style={styles.chips}>
        {template.sizes.map((s) => {
          const active = s === size;
          return (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSize(s)}
              style={[
                styles.chip,
                { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface },
              ]}>
              <AppText variant="label" style={{ color: active ? theme.accentText : theme.text }}>
                {s}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.qtyRow}>
        <AppText variant="label" style={styles.flex}>
          Quantity
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease quantity"
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          style={[styles.qtyButton, { borderColor: theme.border }]}>
          <Ionicons name="remove" size={18} color={theme.text} />
        </Pressable>
        <AppText variant="subheading" style={styles.qty}>
          {quantity}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          onPress={() => setQuantity((q) => q + 1)}
          style={[styles.qtyButton, { borderColor: theme.border }]}>
          <Ionicons name="add" size={18} color={theme.text} />
        </Pressable>
      </View>

      <Button
        title={complete ? (initial ? 'Save composite' : 'Add composite to order') : `Choose ${template.slots.length - filled} more`}
        onPress={save}
        disabled={!complete}
        style={styles.save}
      />
      <AppText variant="caption" center style={styles.hint}>
        This preview shows the layout. The studio finishes every composite by hand before printing.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  step: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  templates: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  templateCard: { width: 120, padding: Spacing.sm, borderWidth: 2, borderRadius: Radius.md, gap: 2 },
  templateThumb: { height: 72, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  description: { marginTop: Spacing.xs },
  previewWrap: { alignItems: 'center' },
  slotBar: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  favToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  strip: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  stripItem: { width: 72, height: 96, borderRadius: Radius.sm, overflow: 'hidden', borderWidth: 3 },
  stripLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  stripLabelText: { color: '#FFFFFF', fontSize: 10 },
  usedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { marginTop: Spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  qty: { minWidth: 24, textAlign: 'center' },
  qtyButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  save: { marginTop: Spacing.lg },
});
