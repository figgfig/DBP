import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Booking,
  BookingRequest,
  ClientUser,
  Gallery,
  HostessApplication,
  PhotoSession,
  PortfolioImage,
  PriceList,
  Proof,
  ProofOrderRequest,
  TimeSlot,
} from '@/lib/types';

import { studioPhoto, studioPhotoNames } from '@/lib/studio-photos';

import type { Api } from './types';

/**
 * Demo provider. Used whenever Supabase is not configured so the app can be
 * reviewed end to end. Images are the studio's own prints and composites
 * when `assets/studio/` is present (see `src/lib/studio-photos.ts`), and
 * grayscale placeholders otherwise.
 */

const DEMO_LOGIN_CODE = '123456';
const USER_KEY = 'dbp.demo.user';
const FAVORITES_KEY = 'dbp.demo.favorites';
const BOOKINGS_KEY = 'dbp.demo.bookings';

/** `startHour` may be fractional: 8.5 is 8:30 AM. */
function slots(sessionId: string, date: string, startHour: number, count: number, taken: number[]): TimeSlot[] {
  return Array.from({ length: count }, (_, i) => {
    const minutes = Math.round(startHour * 60) + i * 15;
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    return {
      id: `${sessionId}-slot-${i}`,
      sessionId,
      startsAt: `${date}T${hh}:${mm}:00`,
      durationMinutes: 15,
      available: !taken.includes(i),
    };
  });
}

/**
 * Real sessions from the calendar on dubosephotography.com (checked 2026-10-09).
 * Every session runs 8:30 AM to 5:00 PM unless noted, in 15-minute slots.
 * Slot availability is not published on the website, so every slot starts open here.
 */
const SESSION_NOTES = 'Please arrive ten minutes before your session. DuBose Photography does not offer digital copies of client images.';
const FULL_DAY = 34; // 8:30 AM to 5:00 PM
const sessions: PhotoSession[] = [
  {
    id: 'atlanta-2026-10',
    city: 'Atlanta',
    state: 'GA',
    startDate: '2026-10-01',
    endDate: '2026-10-02',
    status: 'past',
    notes: SESSION_NOTES,
    hostesses: [{ name: 'Whitney McMurray' }],
    timeSlots: [
      ...slots('atlanta-2026-10', '2026-10-01', 8.5, FULL_DAY, []),
      ...slots('atlanta-2026-10', '2026-10-02', 8.5, 14, []), // 8:30 AM to 12:00 PM
    ],
  },
  {
    id: 'charlotte-2026-10',
    city: 'Charlotte',
    state: 'NC',
    startDate: '2026-10-19',
    endDate: '2026-10-20',
    status: 'open',
    notes: SESSION_NOTES,
    hostesses: [{ name: 'Gatesy Plyler' }],
    timeSlots: [
      ...slots('charlotte-2026-10', '2026-10-19', 8.5, FULL_DAY, []),
      ...slots('charlotte-2026-10', '2026-10-20', 8.5, FULL_DAY, []),
    ],
  },
  {
    id: 'charlotte-lake-norman-2026-10',
    city: 'Charlotte / Lake Norman',
    state: 'NC',
    startDate: '2026-10-21',
    endDate: '2026-10-21',
    status: 'open',
    notes: SESSION_NOTES,
    hostesses: [{ name: 'Jennifer Estridge' }],
    timeSlots: slots('charlotte-lake-norman-2026-10', '2026-10-21', 8.5, FULL_DAY, []),
  },
];

const portfolio: PortfolioImage[] = [
  { id: 'p1', url: studioPhoto('single-1'), caption: 'Single image, 11x14', category: 'single' },
  { id: 'p2', url: studioPhoto('composite-1'), caption: 'Composite, five poses (05 Vertical)', category: 'composite' },
  { id: 'p3', url: studioPhoto('single-2'), caption: 'Single image, 8x10', category: 'single' },
  { id: 'p4', url: studioPhoto('siblings-1'), caption: 'Siblings composite (02 Horizontal)', category: 'siblings' },
  { id: 'p5', url: studioPhoto('single-3'), caption: 'Single image, 5x7', category: 'single' },
  { id: 'p6', url: studioPhoto('composite-2'), caption: 'Composite, three poses (01 Horizontal)', category: 'composite' },
  { id: 'p7', url: studioPhoto('single-4'), caption: 'Single image, 8x10', category: 'single' },
  { id: 'p8', url: studioPhoto('composite-3'), caption: 'Composite, four poses (04 Horizontal)', category: 'composite' },
  { id: 'p9', url: studioPhoto('single-5'), caption: 'Single image, 8x10', category: 'single' },
  { id: 'p10', url: studioPhoto('composite-4'), caption: 'Composite, three poses (027 Horizontal)', category: 'composite' },
];

/**
 * Proof labels are the studio's frame numbers (D203 and so on), as on the
 * order forms. Without the studio photos each gallery gets placeholders.
 */
function proofSet(galleryId: string, prefix: string, fallbackCount: number): Proof[] {
  const names = studioPhotoNames(prefix);
  const labels = names.length
    ? names.map((n) => n.slice(prefix.length))
    : Array.from({ length: fallbackCount }, (_, i) => `D${201 + i * 7}`);
  return labels.map((label, i) => {
    const url = studioPhoto(`${prefix}${label}`, 1200, 1600);
    return {
      id: `${galleryId}-proof-${i + 1}`,
      galleryId,
      label,
      thumbnailUrl: url,
      fullUrl: url,
      width: 1200,
      height: 1600,
    };
  });
}

const proofs: Proof[] = [
  ...proofSet('g-2026-spring', 'proof-a-', 12),
  ...proofSet('g-2025-fall', 'proof-b-', 8),
];

const galleryInfo = (id: string) => {
  const set = proofs.filter((p) => p.galleryId === id);
  return { coverUrl: set[0]?.thumbnailUrl, proofCount: set.length };
};

/**
 * The studio's Spring 2026 price list: what the studio actually charged on its
 * order forms, with package contents and composite rules from its price lists.
 * In production this lives in the price_lists table (see supabase/seed.sql) and
 * only reaches the client who owns the gallery.
 */
const studioPriceList: PriceList = {
  // Single prints are tiered (first print, other poses, reprints), so the studio prices them on the invoice.
  prints: {},
  composites: { '8x10': 375, '11x14': 475, '16x20': 795 },
  compositeExtraChild: 75,
  packages: [
    {
      id: 'package-1',
      name: 'Package 1',
      price: 795,
      contents: [
        { size: '16x20', quantity: 1 },
        { size: '8x10', quantity: 1 },
        { size: '5x7', quantity: 2 },
      ],
      summary: 'One 16x20, one 8x10, two 5x7s',
    },
    {
      id: 'package-2',
      name: 'Package 2',
      price: 550,
      contents: [
        { size: '11x14', quantity: 2 },
        { size: '5x7', quantity: 2 },
      ],
      summary: 'Two 11x14s, two 5x7s',
    },
    {
      id: 'package-3',
      name: 'Package 3',
      price: 475,
      contents: [
        { size: '11x14', quantity: 1 },
        { size: '5x7', quantity: 2 },
        { size: '4 wallets', quantity: 1 },
      ],
      summary: 'One 11x14, two 5x7s, four wallets',
    },
    {
      id: 'package-4',
      name: 'Package 4',
      price: 375,
      contents: [
        { size: '8x10', quantity: 1 },
        { size: '5x7', quantity: 2 },
        { size: '4 wallets', quantity: 1 },
      ],
      summary: 'One 8x10, two 5x7s, four wallets',
    },
  ],
  singles: {
    sizes: ['16x20', '11x14', '8x10', '5x7 / 4x5', '4 wallets'],
    rows: [
      { label: 'First print of each child', prices: [725, 375, 275, 200, null] },
      { label: 'Same child, different pose', prices: [455, 225, 125, 55, 55] },
      { label: 'Reprint, same child, size and pose', prices: [395, 95, 75, 45, null] },
    ],
  },
  notes: [
    'Basic retouching and clean-up of children’s faces is included. Additional retouching is quoted by our photo technicians.',
  ],
};

const galleries: Gallery[] = [
  {
    id: 'g-2026-spring',
    title: 'Spring 2026 Session',
    sessionDate: '2026-03-20',
    ...galleryInfo('g-2026-spring'),
    orderBy: '2026-11-15',
    clientEmail: 'demo@example.com',
    priceList: studioPriceList,
  },
  {
    id: 'g-2025-fall',
    title: 'Fall 2025 Session',
    sessionDate: '2025-10-11',
    ...galleryInfo('g-2025-fall'),
    clientEmail: 'demo@example.com',
    priceList: studioPriceList,
  },
];

const listeners = new Set<(user: ClientUser | null) => void>();

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoApi: Api = {
  providerName: 'demo',

  async listSessions() {
    await delay();
    return [...sessions].sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  async getSession(id) {
    await delay(100);
    return sessions.find((s) => s.id === id) ?? null;
  },

  async listPortfolio() {
    await delay();
    return portfolio;
  },

  async requestBooking(request: BookingRequest) {
    await delay(500);
    const session = sessions.find((s) => s.id === request.sessionId);
    const timeSlot = session?.timeSlots.find((t) => t.id === request.timeSlotId);
    if (timeSlot) timeSlot.available = false;
    const booking: Booking = {
      ...request,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'requested',
      session: session ? { city: session.city, state: session.state, startDate: session.startDate } : undefined,
      timeSlot,
    };
    const existing = await readJson<Booking[]>(BOOKINGS_KEY, []);
    await writeJson(BOOKINGS_KEY, [booking, ...existing]);
    return booking;
  },

  async submitHostessApplication(_application: HostessApplication) {
    await delay(500);
  },

  async getCurrentUser() {
    return readJson<ClientUser | null>(USER_KEY, null);
  },

  async sendLoginCode(email) {
    await delay(400);
    if (!email.includes('@')) throw new Error('Enter a valid email address.');
  },

  async verifyLoginCode(email, code) {
    await delay(400);
    if (code.trim() !== DEMO_LOGIN_CODE) {
      throw new Error(`Incorrect code. In demo mode the code is ${DEMO_LOGIN_CODE}.`);
    }
    const user: ClientUser = { id: 'demo-user', email: email.trim().toLowerCase() };
    await writeJson(USER_KEY, user);
    listeners.forEach((l) => l(user));
    return user;
  },

  async signOut() {
    await AsyncStorage.removeItem(USER_KEY);
    listeners.forEach((l) => l(null));
  },

  onAuthChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  async listGalleries() {
    await delay();
    return galleries;
  },

  async getGallery(id) {
    await delay(100);
    return galleries.find((g) => g.id === id) ?? null;
  },

  async listProofs(galleryId) {
    await delay();
    const favorites = await readJson<string[]>(FAVORITES_KEY, []);
    return proofs
      .filter((p) => p.galleryId === galleryId)
      .map((p) => ({ ...p, isFavorite: favorites.includes(p.id) }));
  },

  async setFavorite(proofId, favorite) {
    const favorites = new Set(await readJson<string[]>(FAVORITES_KEY, []));
    if (favorite) favorites.add(proofId);
    else favorites.delete(proofId);
    await writeJson(FAVORITES_KEY, [...favorites]);
  },

  async submitProofOrder(_order: ProofOrderRequest) {
    await delay(500);
  },

  async listMyBookings() {
    return readJson<Booking[]>(BOOKINGS_KEY, []);
  },
};
