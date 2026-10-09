import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { CompositePreview } from '@/components/composite-preview';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppText } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { cart, useCart } from '@/lib/cart';
import { getTemplate } from '@/lib/composites';
import { PrintSizes, Studio } from '@/lib/content';
import type { CompositeOrderItem, PrintOrderItem, Proof } from '@/lib/types';

/**
 * Print order. Each proof can be ordered in several sizes at once, and
 * composites built in the composite builder appear alongside single prints.
 * Pricing is on the emailed price sheet, so the studio invoices after review.
 */
export default function OrderScreen() {
  const theme = useTheme();
  const { galleryId } = useLocalSearchParams<{ galleryId: string }>();
  const { items } = useCart(galleryId);
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [extraProofIds, setExtraProofIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listProofs(galleryId).then((all) => {
      setProofs(all);
      cart.seed(
        galleryId,
        all
          .filter((p) => p.isFavorite)
          .map<PrintOrderItem>((p) => ({ kind: 'print', proofId: p.id, label: p.label, size: PrintSizes[1], quantity: 1 }))
      );
    });
  }, [galleryId]);

  const prints = items.filter((i): i is PrintOrderItem => i.kind === 'print');
  const composites = items.filter((i): i is CompositeOrderItem => i.kind === 'composite');
  const proofById = new Map((proofs ?? []).map((p) => [p.id, p]));

  // Proofs shown as print cards: anything with a size in the cart, plus proofs just added with nothing chosen yet.
  const printProofIds = [...new Set([...prints.map((p) => p.proofId), ...extraProofIds])];
  const remaining = (proofs ?? []).filter((p) => !printProofIds.includes(p.id));
  const totalPrints = prints.reduce((sum, p) => sum + p.quantity, 0);
  const totalComposites = composites.reduce((sum, c) => sum + c.quantity, 0);
  const totalItems = totalPrints + totalComposites;

  function qtyFor(proofId: string, size: string) {
    return prints.find((p) => p.proofId === proofId && p.size === size)?.quantity ?? 0;
  }

  function removeProof(proofId: string) {
    cart.removeProof(galleryId, proofId);
    setExtraProofIds((prev) => prev.filter((id) => id !== proofId));
  }

  async function submit() {
    if (totalItems === 0) return;
    setSubmitting(true);
    try {
      await api.submitProofOrder({ galleryId, items, notes: notes.trim() || undefined });
      cart.clear(galleryId);
      Alert.alert('Order sent', `The studio will confirm your order and send an invoice to your email. Questions? ${Studio.email}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Could not send order', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      <AppText color="textSecondary">
        Order each proof in as many sizes as you like, and build composites from several proofs. Prices are on your price sheet. The
        studio confirms every order before printing.
      </AppText>

      <SectionHeader eyebrow="Composites" title="Several poses, one print" />
      {composites.map((c) => {
        const template = getTemplate(c.templateId);
        const images = Object.fromEntries(c.slots.map((s) => [s.slotId, proofById.get(s.proofId)?.thumbnailUrl]));
        return (
          <Card key={c.id}>
            <View style={styles.compositeRow}>
              {template ? (
                <CompositePreview
                  template={template}
                  images={images}
                  width={template.aspectRatio >= 1 ? 120 : 72}
                  showSlotNumbers={false}
                />
              ) : null}
              <View style={styles.flex}>
                <AppText variant="subheading">{c.templateName}</AppText>
                <AppText variant="caption">{c.slots.map((s) => s.label).join(', ')}</AppText>
                <AppText variant="caption">Size {c.size}</AppText>
              </View>
            </View>
            <View style={styles.compositeActions}>
              <Stepper
                value={c.quantity}
                min={1}
                onChange={(q) => cart.setCompositeQuantity(galleryId, c.id, q)}
                label={`${c.templateName} quantity`}
              />
              <View style={styles.flex} />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/composite', params: { galleryId, compositeId: c.id } })}
                hitSlop={8}>
                <AppText variant="label" color="accent">
                  Edit
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${c.templateName}`}
                onPress={() => cart.removeComposite(galleryId, c.id)}
                hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
              </Pressable>
            </View>
          </Card>
        );
      })}
      <Button
        title={composites.length ? 'Create another composite' : 'Create a composite'}
        variant="secondary"
        onPress={() => router.push({ pathname: '/composite', params: { galleryId } })}
      />

      <SectionHeader eyebrow="Single prints" title="Choose sizes for each proof" />
      {printProofIds.length === 0 ? (
        <Card>
          <AppText color="textSecondary">Add proofs below, or mark favorites in your gallery first.</AppText>
        </Card>
      ) : (
        printProofIds.map((proofId) => {
          const proof = proofById.get(proofId);
          if (!proof) return null;
          const proofTotal = PrintSizes.reduce((sum, s) => sum + qtyFor(proofId, s), 0);
          return (
            <Card key={proofId}>
              <View style={styles.lineRow}>
                <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt }]}>
                  <Image source={{ uri: proof.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                </View>
                <View style={styles.flex}>
                  <View style={styles.lineHeader}>
                    <AppText variant="subheading">{proof.label}</AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${proof.label}`}
                      onPress={() => removeProof(proofId)}
                      hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
                    </Pressable>
                  </View>
                  <AppText variant="caption">
                    {proofTotal === 0 ? 'Set a quantity on any size.' : `${proofTotal} print${proofTotal === 1 ? '' : 's'}`}
                  </AppText>
                </View>
              </View>
              <View style={[styles.sizeTable, { borderTopColor: theme.border }]}>
                {PrintSizes.map((size) => {
                  const qty = qtyFor(proofId, size);
                  return (
                    <View key={size} style={styles.sizeRow}>
                      <AppText style={[styles.flex, qty > 0 ? styles.sizeActive : null]} color={qty > 0 ? 'text' : 'textSecondary'}>
                        {size}
                      </AppText>
                      <Stepper
                        value={qty}
                        min={0}
                        onChange={(q) => cart.setPrintQuantity(galleryId, { proofId, label: proof.label }, size, q)}
                        label={`${proof.label} ${size} quantity`}
                      />
                    </View>
                  );
                })}
              </View>
            </Card>
          );
        })
      )}

      {remaining.length > 0 ? (
        <>
          <AppText variant="eyebrow" style={styles.sectionTitle}>
            Add more proofs
          </AppText>
          <View style={styles.addGrid}>
            {remaining.map((proof) => (
              <Pressable
                key={proof.id}
                accessibilityRole="button"
                accessibilityLabel={`Add ${proof.label}`}
                onPress={() => setExtraProofIds((prev) => [...prev, proof.id])}
                style={[styles.addTile, { backgroundColor: theme.surfaceAlt }]}>
                <Image source={{ uri: proof.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
                <View style={styles.addLabel}>
                  <AppText variant="caption" style={styles.addLabelText}>
                    {proof.label}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <TextField
        label="Notes for the studio (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Framing, retouching, gift prints..."
      />
      <Card>
        <AppText variant="label">Order summary</AppText>
        <AppText color="textSecondary">
          {totalPrints} single print{totalPrints === 1 ? '' : 's'} · {totalComposites} composite{totalComposites === 1 ? '' : 's'}
        </AppText>
      </Card>
      <Button title={`Send order (${totalItems})`} onPress={submit} loading={submitting} disabled={totalItems === 0} />
    </Screen>
  );
}

function Stepper({ value, min, onChange, label }: { value: number; min: number; onChange: (v: number) => void; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.qtyButton, { borderColor: theme.border, opacity: value <= min ? 0.4 : 1 }]}>
        <Ionicons name="remove" size={16} color={theme.text} />
      </Pressable>
      <AppText variant="label" style={styles.qty} accessibilityLabel={`${label}: ${value}`}>
        {value}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        onPress={() => onChange(value + 1)}
        style={[styles.qtyButton, { borderColor: value > 0 ? theme.accent : theme.border }]}>
        <Ionicons name="add" size={16} color={value > 0 ? theme.accent : theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  compositeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  compositeActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md },
  lineRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  thumb: { width: 56, height: 75, borderRadius: Radius.sm, overflow: 'hidden' },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizeTable: { marginTop: Spacing.sm, paddingTop: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  sizeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  sizeActive: { fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qty: { minWidth: 22, textAlign: 'center' },
  qtyButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  addGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  addTile: { width: 72, height: 96, borderRadius: Radius.sm, overflow: 'hidden' },
  addLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 4, paddingVertical: 2 },
  addLabelText: { color: '#FFFFFF', fontSize: 10 },
});
