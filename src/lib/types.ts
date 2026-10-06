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
  sittingFee: number;
  minimumOrder: number;
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

export interface ProofOrderRequest {
  galleryId: string;
  items: { proofId: string; label: string; size: string; quantity: number }[];
  notes?: string;
}
