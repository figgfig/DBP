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
import { PackageRules, PrintSizes, Studio } from '@/lib/content';
import { formatMoney } from '@/lib/format';
import type { CompositeOrderItem, Gallery, PackageOrderItem, PriceList, PrintOrderItem, Proof } from '@/lib/types';

/**
 * Print order. Each proof can be ordered in several sizes and packages at
 * once, and composites built in the composite builder appear alongside.
 *
 * This screen (and the composite builder) are the ONLY places prices appear.
 * They come from the gallery's price list, which the backend only returns to
 * the signed-in client who owns the gallery.
 */
export default function OrderScreen() {
  const theme = useTheme();
  const { galleryId } = useLocalSearchParams<{ galleryId: string }>();
  const { items } = useCart(galleryId);
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [extraProofIds, setExtraProofIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.listProofs(galleryId), api.getGallery(galleryId)]).then(([all, g]) => {
      setProofs(all);
      setGallery(g);
      const sizes = sizesFor(g?.priceList);
      const defaultSize = sizes.includes('8x10') ? '8x10' : sizes[0];
      cart.seed(
        galleryId,
        all
          .filter((p) => p.isFavorite)
          .map<PrintOrderItem>((p) => ({ kind: 'print', proofId: p.id, label: p.label, size: defaultSize, quantity: 1 }))
      );
    });
  }, [galleryId]);

  const prints = items.filter((i): i is PrintOrderItem => i.kind === 'print');
  const composites = items.filter((i): i is CompositeOrderItem => i.kind === 'composite');
  const packages = items.filter((i): i is PackageOrderItem => i.kind === 'package');
  const proofById = new Map((proofs ?? []).map((p) => [p.id, p]));

  // Proofs shown as print cards: anything with a size in the cart, plus proofs just added with nothing chosen yet.
  const printProofIds = [...new Set([...prints.map((p) => p.proofId), ...packages.map((p) => p.proofId), ...extraProofIds])];
  const remaining = (proofs ?? []).filter((p) => !printProofIds.includes(p.id));
  const totalPrints = prints.reduce((sum, p) => sum + p.quantity, 0);
  const totalComposites = composites.reduce((sum, c) => sum + c.quantity, 0);
  const totalPackages = packages.reduce((sum, p) => sum + p.quantity, 0);
  const totalItems = totalPrints + totalComposites + totalPackages;

  const priceList = gallery?.priceList;
  const printSizes = sizesFor(priceList);
  const printPrice = (size: string) => priceList?.prints[size];
  const compositePrice = (c: CompositeOrderItem) => {
    const base = priceList?.composites[c.size];
    return base === undefined ? undefined : compositeTotal(base, c.quantity);
  };
  const lineTotals = items.map((i) => {
    if (i.kind === 'package') return i.price * i.quantity;
    if (i.kind === 'composite') return compositePrice(i);
    const unit = printPrice(i.size);
    return unit === undefined ? undefined : unit * i.quantity;
  });
  const estimatedTotal = lineTotals.reduce<number>((sum, t) => sum + (t ?? 0), 0);
  const unpricedCount = lineTotals.filter((t) => t === undefined).length;

  function qtyFor(proofId: string, size: string) {
    return prints.find((p) => p.proofId === proofId && p.size === size)?.quantity ?? 0;
  }

  function packageQtyFor(proofId: string, packageId: string) {
    return packages.find((p) => p.proofId === proofId && p.packageId === packageId)?.quantity ?? 0;
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
        Order each proof in as many sizes or packages as you like, and build composites from several proofs.{' '}
        {priceList
          ? 'Your sitting fee is credited on your invoice. The studio confirms every order before printing.'
          : 'Prices are on your price sheet. The studio confirms every order before printing.'}
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
                <AppText variant="caption">
                  Size {c.size}
                  {compositePrice(c) !== undefined ? ` · ${formatMoney(compositePrice(c)!)}` : ''}
                </AppText>
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

      <AppText variant="caption">
        {priceList?.compositeExtraChild
          ? `Add ${formatMoney(priceList.compositeExtraChild)} for each additional child in the same composite. `
          : ''}
        A second print of the same composite is half price. More than one child in a composite? Say so in the notes.
      </AppText>

      <SectionHeader eyebrow="Single prints and packages" title="Choose sizes for each proof" />
      {printProofIds.length === 0 ? (
        <Card>
          <AppText color="textSecondary">Add proofs below, or mark favorites in your gallery first.</AppText>
        </Card>
      ) : (
        printProofIds.map((proofId) => {
          const proof = proofById.get(proofId);
          if (!proof) return null;
          const proofTotal = printSizes.reduce((sum, s) => sum + qtyFor(proofId, s), 0);
          const proofPackages = (priceList?.packages ?? []).reduce((sum, p) => sum + packageQtyFor(proofId, p.id), 0);
          const proofSummary = [
            proofTotal ? `${proofTotal} print${proofTotal === 1 ? '' : 's'}` : '',
            proofPackages ? `${proofPackages} package${proofPackages === 1 ? '' : 's'}` : '',
          ]
            .filter(Boolean)
            .join(' · ');
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
                    {proofSummary || 'Set a quantity on any size or package.'}
                  </AppText>
                </View>
              </View>
              <View style={[styles.sizeTable, { borderTopColor: theme.border }]}>
                {printSizes.map((size) => {
                  const qty = qtyFor(proofId, size);
                  const price = printPrice(size);
                  return (
                    <View key={size} style={styles.sizeRow}>
                      <View style={styles.flex}>
                        <AppText style={qty > 0 ? styles.sizeActive : null} color={qty > 0 ? 'text' : 'textSecondary'}>
                          {size}
                        </AppText>
                        {price !== undefined ? <AppText variant="caption">{formatMoney(price)} each</AppText> : null}
                      </View>
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
              {priceList?.packages?.length ? (
              <View style={[styles.sizeTable, { borderTopColor: theme.border }]}>
                {priceList.packages.map((pkg) => {
                  const qty = packageQtyFor(proofId, pkg.id);
                  return (
                    <View key={pkg.id} style={styles.sizeRow}>
                      <View style={styles.flex}>
                        <AppText style={qty > 0 ? styles.sizeActive : null} color={qty > 0 ? 'text' : 'textSecondary'}>
                          {pkg.name} · {formatMoney(pkg.price)}
                        </AppText>
                        <AppText variant="caption">{pkg.summary}</AppText>
                      </View>
                      <Stepper
                        value={qty}
                        min={0}
                        onChange={(q) => cart.setPackageQuantity(galleryId, { proofId, label: proof.label }, pkg, q)}
                        label={`${proof.label} ${pkg.name} quantity`}
                      />
                    </View>
                  );
                })}
                <AppText variant="caption" style={styles.packageRule}>
                  {PackageRules}
                </AppText>
              </View>
              ) : null}
            </Card>
          );
        })
      )}

      {priceList?.singles ? <SinglePrices singles={priceList.singles} /> : null}

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
          {totalPrints} single print{totalPrints === 1 ? '' : 's'} · {totalPackages} package{totalPackages === 1 ? '' : 's'} ·{' '}
          {totalComposites} composite{totalComposites === 1 ? '' : 's'}
        </AppText>
        {priceList && totalItems > 0 ? (
          <>
            <View style={styles.totalRow}>
              <AppText variant="subheading" style={styles.flex}>
                Estimated total
              </AppText>
              <AppText variant="subheading">{formatMoney(estimatedTotal)}</AppText>
            </View>
            <AppText variant="caption">
              {unpricedCount > 0
                ? `${unpricedCount} item${unpricedCount === 1 ? ' is' : 's are'} priced by the studio. `
                : ''}
              Extra children, tax and shipping are added and your sitting fee is credited on the final invoice.
            </AppText>
          </>
        ) : null}
        <AppText variant="caption" style={styles.packageRule}>
          The studio emails an invoice before printing. Pay by Venmo at @dubphotos.
        </AppText>
        {priceList?.notes?.map((n) => (
          <AppText key={n} variant="caption" style={styles.packageRule}>
            {n}
          </AppText>
        ))}
      </Card>
      <Button title={`Send order (${totalItems})`} onPress={submit} loading={submitting} disabled={totalItems === 0} />
    </Screen>
  );
}

/** Sizes offered for single prints: the price list's own sizes, or every size when singles are priced on the invoice. */
function sizesFor(priceList: PriceList | undefined): string[] {
  const priced = priceList ? Object.keys(priceList.prints) : [];
  return priced.length ? priced : PrintSizes;
}

/** Composite price: the first print at full price, each extra print of the same composite at half price. */
function compositeTotal(base: number, quantity: number): number {
  return base + (quantity - 1) * (base / 2);
}

/** Reference table of tiered single-image prices from the gallery's price list. */
function SinglePrices({ singles }: { singles: NonNullable<PriceList['singles']> }) {
  return (
    <Card>
      <AppText variant="label">Single image prices</AppText>
      {singles.rows.map((row) => (
        <View key={row.label} style={styles.singleRow}>
          <AppText variant="subheading">{row.label}</AppText>
          {singles.sizes.map((size, i) =>
            row.prices[i] == null ? null : (
              <View key={size} style={styles.priceRowTight}>
                <AppText color="textSecondary" style={styles.flex}>
                  {size}
                </AppText>
                <AppText>{formatMoney(row.prices[i] as number)}</AppText>
              </View>
            )
          )}
        </View>
      ))}
      <AppText variant="caption" style={styles.packageRule}>
        After a composite, package, or first print, more single images of that child use the lower rows. The studio applies the
        right row on your invoice.
      </AppText>
    </Card>
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
  packageRule: { marginTop: Spacing.xs },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xs },
  singleRow: { marginTop: Spacing.sm },
  priceRowTight: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qty: { minWidth: 22, textAlign: 'center' },
  qtyButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  addGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  addTile: { width: 72, height: 96, borderRadius: Radius.sm, overflow: 'hidden' },
  addLabel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 4, paddingVertical: 2 },
  addLabelText: { color: '#FFFFFF', fontSize: 10 },
});
