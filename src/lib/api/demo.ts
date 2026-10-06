import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Booking,
  BookingRequest,
  ClientUser,
  Gallery,
  HostessApplication,
  PhotoSession,
  PortfolioImage,
  Proof,
  ProofOrderRequest,
  TimeSlot,
} from '@/lib/types';

import type { Api } from './types';

/**
 * Demo provider. Used whenever Supabase is not configured so the app can be
 * reviewed end to end. Sample images are black-and-white placeholders and
 * must be replaced with the studio's own photographs before release.
 */

const DEMO_LOGIN_CODE = '123456';
const USER_KEY = 'dbp.demo.user';
const FAVORITES_KEY = 'dbp.demo.favorites';
const BOOKINGS_KEY = 'dbp.demo.bookings';

const placeholder = (seed: string, w = 600, h = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}?grayscale`;

function slots(sessionId: string, date: string, startHour: number, count: number, taken: number[]): TimeSlot[] {
  return Array.from({ length: count }, (_, i) => {
    const minutes = startHour * 60 + i * 15;
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

const sessions: PhotoSession[] = [
  {
    id: 'atlanta-2026-10',
    city: 'Atlanta',
    state: 'GA',
    venueName: 'Private residence, Buckhead',
    startDate: '2026-10-16',
    endDate: '2026-10-17',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'open',
    notes: 'Indoor session. Exact address is shared by the hostess after your time is confirmed.',
    hostesses: [
      { name: 'Emily Karempelis', email: 'dubosephotographyatlanta@gmail.com' },
      { name: 'Bridget Keller', email: 'dubosephotographyatlanta@gmail.com' },
    ],
    timeSlots: [
      ...slots('atlanta-2026-10', '2026-10-16', 9, 20, [0, 1, 4, 7, 8, 12]),
      ...slots('atlanta-2026-10', '2026-10-17', 9, 16, [2, 3, 9]),
    ],
  },
  {
    id: 'st-simons-2026-10',
    city: 'St. Simons Island',
    state: 'GA',
    startDate: '2026-10-22',
    endDate: '2026-10-22',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'waitlist',
    hostesses: [{ name: 'Molly Nobles', email: 'mollyrnobles@gmail.com' }],
    timeSlots: slots('st-simons-2026-10', '2026-10-22', 9, 20, Array.from({ length: 20 }, (_, i) => i)),
  },
  {
    id: 'charlotte-2026-11',
    city: 'Charlotte',
    state: 'NC',
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'open',
    hostesses: [{ name: 'Meredith Chapman', email: 'hostess@example.com' }],
    timeSlots: slots('charlotte-2026-11', '2026-11-06', 10, 16, [0, 5, 6]),
  },
  {
    id: 'mount-pleasant-2026-11',
    city: 'Mount Pleasant',
    state: 'SC',
    startDate: '2026-11-14',
    endDate: '2026-11-14',
    sittingFee: 75,
    minimumOrder: 75,
    status: 'open',
    notes: 'Home session near the studio. Fee is applied to each child’s order with a $75 minimum per child.',
    hostesses: [{ name: 'Studio', email: 'ordersdbp@gmail.com', phone: '(843) 442-4096' }],
    timeSlots: slots('mount-pleasant-2026-11', '2026-11-14', 9, 12, [1]),
  },
  {
    id: 'augusta-2027-03',
    city: 'Augusta',
    state: 'GA',
    startDate: '2027-03-12',
    endDate: '2027-03-12',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'open',
    hostesses: [{ name: 'Christina Lake', email: 'christinaelake@gmail.com' }],
    timeSlots: slots('augusta-2027-03', '2027-03-12', 9, 20, []),
  },
  {
    id: 'birmingham-2027-04',
    city: 'Birmingham',
    state: 'AL',
    startDate: '2027-04-09',
    endDate: '2027-04-10',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'open',
    hostesses: [
      { name: 'Mary Coleman Clark', email: 'hostess@example.com' },
      { name: 'Rachel Weingartner', email: 'hostess@example.com' },
    ],
    timeSlots: [
      ...slots('birmingham-2027-04', '2027-04-09', 9, 20, []),
      ...slots('birmingham-2027-04', '2027-04-10', 9, 20, []),
    ],
  },
  {
    id: 'raleigh-2026-03',
    city: 'Raleigh',
    state: 'NC',
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    sittingFee: 100,
    minimumOrder: 200,
    status: 'past',
    hostesses: [{ name: 'Hostess', email: 'hostess@example.com' }],
    timeSlots: [],
  },
];

const portfolio: PortfolioImage[] = [
  { id: 'p1', url: placeholder('dbp-portfolio-1'), caption: 'Single image, 8x10', category: 'single' },
  { id: 'p2', url: placeholder('dbp-portfolio-2'), caption: 'Siblings', category: 'siblings' },
  { id: 'p3', url: placeholder('dbp-portfolio-3'), caption: 'Composite, three poses', category: 'composite' },
  { id: 'p4', url: placeholder('dbp-portfolio-4'), caption: 'Single image', category: 'single' },
  { id: 'p5', url: placeholder('dbp-portfolio-5'), caption: 'Single image', category: 'single' },
  { id: 'p6', url: placeholder('dbp-portfolio-6'), caption: 'Siblings', category: 'siblings' },
  { id: 'p7', url: placeholder('dbp-portfolio-7'), caption: 'Composite', category: 'composite' },
  { id: 'p8', url: placeholder('dbp-portfolio-8'), caption: 'Single image', category: 'single' },
  { id: 'p9', url: placeholder('dbp-portfolio-9'), caption: 'Single image', category: 'single' },
];

const galleries: Gallery[] = [
  {
    id: 'g-2026-spring',
    title: 'Spring 2026 Session',
    sessionDate: '2026-03-20',
    coverUrl: placeholder('dbp-proof-g1-1', 400, 533),
    proofCount: 12,
    orderBy: '2026-11-15',
    clientEmail: 'demo@example.com',
  },
  {
    id: 'g-2025-fall',
    title: 'Fall 2025 Session',
    sessionDate: '2025-10-11',
    coverUrl: placeholder('dbp-proof-g2-1', 400, 533),
    proofCount: 8,
    clientEmail: 'demo@example.com',
  },
];

const proofs: Proof[] = galleries.flatMap((g, gi) =>
  Array.from({ length: g.proofCount }, (_, i) => ({
    id: `${g.id}-proof-${i + 1}`,
    galleryId: g.id,
    label: `DBP-${gi + 1}${String(i + 1).padStart(3, '0')}`,
    thumbnailUrl: placeholder(`dbp-proof-g${gi + 1}-${i + 1}`, 400, 533),
    fullUrl: placeholder(`dbp-proof-g${gi + 1}-${i + 1}`, 1200, 1600),
    width: 1200,
    height: 1600,
  }))
);

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
