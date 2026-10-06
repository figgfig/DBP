import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Loading } from '@/components/loading';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { TextField } from '@/components/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { PrintSizes, Studio } from '@/lib/content';
import type { Proof } from '@/lib/types';

type Line = { proofId: string; label: string; size: string; quantity: number };

/**
 * Lets a client send print selections to the studio. Pricing is on the
 * emailed price sheet, so the app collects selections and the studio invoices.
 */
export default function OrderScreen() {
  const theme = useTheme();
  const { galleryId } = useLocalSearchParams<{ galleryId: string }>();
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listProofs(galleryId).then((all) => {
      setProofs(all);
      setLines(all.filter((p) => p.isFavorite).map((p) => ({ proofId: p.id, label: p.label, size: PrintSizes[1], quantity: 1 })));
    });
  }, [galleryId]);

  function update(proofId: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.proofId === proofId ? { ...l, ...patch } : l)));
  }

  function addProof(proof: Proof) {
    setLines((prev) => [...prev, { proofId: proof.id, label: proof.label, size: PrintSizes[1], quantity: 1 }]);
  }

  async function submit() {
    if (lines.length === 0) return;
    setSubmitting(true);
    try {
      await api.submitProofOrder({ galleryId, items: lines, notes: notes.trim() || undefined });
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

  const remaining = proofs.filter((p) => !lines.some((l) => l.proofId === p.id));

  return (
    <Screen>
      <AppText color="textSecondary" style={styles.intro}>
        Choose a size and quantity for each proof. Prices are on your price sheet. The studio confirms every order before printing.
      </AppText>

      {lines.length === 0 ? (
        <EmptyState icon="heart-outline" title="No proofs selected" body="Add proofs below, or mark favorites in your gallery first." />
      ) : (
        lines.map((line) => {
          const proof = proofs.find((p) => p.id === line.proofId);
          return (
            <Card key={line.proofId}>
              <View style={styles.lineRow}>
                <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt }]}>
                  {proof ? <Image source={{ uri: proof.thumbnailUrl }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
                </View>
                <View style={styles.lineBody}>
                  <View style={styles.lineHeader}>
                    <AppText variant="subheading">{line.label}</AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${line.label}`}
                      onPress={() => setLines((prev) => prev.filter((l) => l.proofId !== line.proofId))}
                      hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
                    </Pressable>
                  </View>
                  <View style={styles.sizes}>
                    {PrintSizes.map((size) => {
                      const active = line.size === size;
                      return (
                        <Pressable
                          key={size}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          onPress={() => update(line.proofId, { size })}
                          style={[
                            styles.sizeChip,
                            { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent : theme.surface },
                          ]}>
                          <AppText variant="caption" style={{ color: active ? theme.accentText : theme.text, fontWeight: '600' }}>
                            {size}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.qtyRow}>
                    <AppText variant="caption">Quantity</AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Decrease quantity"
                      onPress={() => update(line.proofId, { quantity: Math.max(1, line.quantity - 1) })}
                      style={[styles.qtyButton, { borderColor: theme.border }]}>
                      <Ionicons name="remove" size={18} color={theme.text} />
                    </Pressable>
                    <AppText variant="label">{line.quantity}</AppText>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Increase quantity"
                      onPress={() => update(line.proofId, { quantity: line.quantity + 1 })}
                      style={[styles.qtyButton, { borderColor: theme.border }]}>
                      <Ionicons name="add" size={18} color={theme.text} />
                    </Pressable>
                  </View>
                </View>
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
                onPress={() => addProof(proof)}
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

      <TextField label="Notes for the studio (optional)" value={notes} onChangeText={setNotes} multiline placeholder="Framing, composites, gift prints..." />
      <Button title={`Send order (${lines.length})`} onPress={submit} loading={submitting} disabled={lines.length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: Spacing.md },
  lineRow: { flexDirection: 'row', gap: Spacing.md },
  thumb: { width: 72, height: 96, borderRadius: Radius.sm, overflow: 'hidden' },
  lineBody: { flex: 1, gap: Spacing.sm },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sizeChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  addGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  addTile: { width: 72, height: 96, borderRadius: Radius.sm, overflow: 'hidden' },
  addLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 4, paddingVertical: 2 },
  addLabelText: { color: '#FFFFFF', fontSize: 10 },
});
