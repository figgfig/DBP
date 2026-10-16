/** Shared domain types used by every API provider and screen. */

export type SessionStatus = 'open' | 'waitlist' | 'full' | 'past';

export interface PhotoSession {
  id: string;
  city: string;
  state: string;
  venueName?: string;
  address?: string;
  /** ISO date (YYYY-MM-DD) of the first day of the session. */
  startDate: string;
  /** ISO date of the last day (same as startDate for one-day sessions). */
  endDate: string;
  status: SessionStatus;
  notes?: string;
  hostesses: Hostess[];
  timeSlots: TimeSlot[];
}

export interface Hostess {
  name: string;
  email?: string;
  phone?: string;
}

export interface TimeSlot {
  id: string;
  sessionId: string;
  /** ISO datetime of the slot start. */
  startsAt: string;
  durationMinutes: number;
  available: boolean;
}

export interface BookingRequest {
  sessionId: string;
  timeSlotId?: string;
  parentName: string;
  email: string;
  phone: string;
  children: { name: string; age: string }[];
  notes?: string;
}

export interface Booking extends BookingRequest {
  id: string;
  createdAt: string;
  status: 'requested' | 'confirmed' | 'cancelled';
  session?: Pick<PhotoSession, 'city' | 'state' | 'startDate'>;
  timeSlot?: TimeSlot;
}

export interface HostessApplication {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  preferredSeason: 'spring' | 'fall' | 'either';
  venueIdea?: string;
  estimatedFamilies?: string;
  message?: string;
}

/**
 * Prices for one gallery's order. Only ever loaded for a signed-in client who
 * owns the gallery: prices are never shown anywhere else in the app.
 */
export interface PriceList {
  /**
   * Single print price by size, e.g. { "8x10": 55 }. The key order is the order sizes are listed in.
   * Empty when single prints are tiered (see `singles`): the studio then prices them on the invoice.
   */
  prints: Record<string, number>;
  /** Composite price by size. Each extra print of the same composite is half price. */
  composites: Record<string, number>;
  /** Added to a composite for each additional child in it. */
  compositeExtraChild?: number;
  packages?: PrintPackage[];
  /** Tiered single-image prices, shown as a reference table. Each row's prices line up with `sizes`; null means not sold that way. */
  singles?: { sizes: string[]; rows: { label: string; prices: (number | null)[] }[] };
  notes?: string[];
}

export interface PrintPackage {
  id: string;
  name: string;
  price: number;
  /** What the package contains. Every print in a package is the same pose. */
  contents: { size: string; quantity: number }[];
  summary: string;
}

export interface Gallery {
  id: string;
  title: string;
  /** Session date the proofs came from. */
  sessionDate: string;
  coverUrl?: string;
  proofCount: number;
  /** Ordering deadline shown to the client, if any. */
  orderBy?: string;
  priceSheetUrl?: string;
  priceList?: PriceList;
  clientEmail?: string;
}

export interface Proof {
  id: string;
  galleryId: string;
  /** Proof number printed on the image, e.g. "DBP-0142". */
  label: string;
  thumbnailUrl: string;
  fullUrl: string;
  width?: number;
  height?: number;
  isFavorite?: boolean;
}

export interface PortfolioImage {
  id: string;
  url: string;
  caption?: string;
  category: 'single' | 'composite' | 'siblings';
}

export interface ClientUser {
  id: string;
  email: string;
  name?: string;
}

/** One print of a single proof at one size. The same proof may appear once per size. */
export interface PrintOrderItem {
  kind: 'print';
  proofId: string;
  label: string;
  size: string;
  quantity: number;
}

/** A composite: several proofs arranged in one of the studio's templates. */
export interface CompositeOrderItem {
  kind: 'composite';
  /** Client-side id so a composite can be edited before the order is sent. */
  id: string;
  templateId: string;
  templateName: string;
  size: string;
  quantity: number;
  /** Proof chosen for each template slot, in slot order. */
  slots: { slotId: string; proofId: string; label: string }[];
}

/** A print package of one proof (see PriceList.packages). Every print in it is that pose. */
export interface PackageOrderItem {
  kind: 'package';
  proofId: string;
  label: string;
  packageId: string;
  packageName: string;
  price: number;
  quantity: number;
}

export type OrderItem = PrintOrderItem | CompositeOrderItem | PackageOrderItem;

export interface ProofOrderRequest {
  galleryId: string;
  items: OrderItem[];
  notes?: string;
}
