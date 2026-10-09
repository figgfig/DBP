import { useSyncExternalStore } from 'react';

import type { CompositeOrderItem, OrderItem, PrintOrderItem } from '@/lib/types';

/**
 * In-memory order cart, one per gallery. Shared by the order screen and the
 * composite builder so a composite built in one screen shows up in the other.
 */

type Cart = { items: OrderItem[]; seeded: boolean };

const carts = new Map<string, Cart>();
const listeners = new Set<() => void>();
const EMPTY: Cart = { items: [], seeded: false };

function emit() {
  listeners.forEach((l) => l());
}

function update(galleryId: string, fn: (cart: Cart) => Cart) {
  carts.set(galleryId, fn(carts.get(galleryId) ?? EMPTY));
  emit();
}

export function useCart(galleryId: string): Cart {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => carts.get(galleryId) ?? EMPTY,
    () => carts.get(galleryId) ?? EMPTY
  );
}

export const cart = {
  /** Adds one print line per favorite the first time the cart is opened. */
  seed(galleryId: string, items: PrintOrderItem[]) {
    update(galleryId, (c) => (c.seeded ? c : { items: [...c.items, ...items], seeded: true }));
  },

  /** Sets the quantity of a proof at a size. Quantity 0 removes that size. */
  setPrintQuantity(galleryId: string, proof: { proofId: string; label: string }, size: string, quantity: number) {
    update(galleryId, (c) => {
      const others = c.items.filter((i) => !(i.kind === 'print' && i.proofId === proof.proofId && i.size === size));
      if (quantity <= 0) return { ...c, items: others };
      const existingIndex = c.items.findIndex((i) => i.kind === 'print' && i.proofId === proof.proofId && i.size === size);
      const line: PrintOrderItem = { kind: 'print', proofId: proof.proofId, label: proof.label, size, quantity };
      if (existingIndex === -1) return { ...c, items: [...c.items, line] };
      const items = [...c.items];
      items[existingIndex] = line;
      return { ...c, items };
    });
  },

  /** Removes every size of a proof. */
  removeProof(galleryId: string, proofId: string) {
    update(galleryId, (c) => ({ ...c, items: c.items.filter((i) => !(i.kind === 'print' && i.proofId === proofId)) }));
  },

  /** Adds a composite, or replaces it if one with the same id exists. */
  saveComposite(galleryId: string, composite: CompositeOrderItem) {
    update(galleryId, (c) => {
      const exists = c.items.some((i) => i.kind === 'composite' && i.id === composite.id);
      return {
        ...c,
        items: exists
          ? c.items.map((i) => (i.kind === 'composite' && i.id === composite.id ? composite : i))
          : [...c.items, composite],
      };
    });
  },

  removeComposite(galleryId: string, id: string) {
    update(galleryId, (c) => ({ ...c, items: c.items.filter((i) => !(i.kind === 'composite' && i.id === id)) }));
  },

  setCompositeQuantity(galleryId: string, id: string, quantity: number) {
    update(galleryId, (c) => ({
      ...c,
      items: c.items.map((i) => (i.kind === 'composite' && i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)),
    }));
  },

  clear(galleryId: string) {
    carts.set(galleryId, { items: [], seeded: true });
    emit();
  },
};
