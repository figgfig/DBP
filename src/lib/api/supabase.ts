import type {
  Booking,
  BookingRequest,
  ClientUser,
  HostessApplication,
  PhotoSession,
  PortfolioImage,
  ProofOrderRequest,
  TimeSlot,
} from '@/lib/types';

import { getSupabase } from './supabase-client';
import type { Api } from './types';

/**
 * Supabase provider. The schema it expects lives in supabase/schema.sql.
 * Row level security keeps each client limited to their own galleries,
 * proofs, favorites and bookings.
 */

type SessionRow = {
  id: string;
  city: string;
  state: string;
  venue_name: string | null;
  address: string | null;
  start_date: string;
  end_date: string;
  sitting_fee: number;
  minimum_order: number;
  status: PhotoSession['status'];
  notes: string | null;
  session_hostesses: { name: string; email: string | null; phone: string | null }[];
  time_slots: { id: string; starts_at: string; duration_minutes: number; available: boolean }[];
};

const SESSION_SELECT =
  'id, city, state, venue_name, address, start_date, end_date, sitting_fee, minimum_order, status, notes, session_hostesses(name, email, phone), time_slots(id, starts_at, duration_minutes, available)';

function mapSession(row: SessionRow): PhotoSession {
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    venueName: row.venue_name ?? undefined,
    address: row.address ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    sittingFee: Number(row.sitting_fee),
    minimumOrder: Number(row.minimum_order),
    status: row.status,
    notes: row.notes ?? undefined,
    hostesses: (row.session_hostesses ?? []).map((h) => ({
      name: h.name,
      email: h.email ?? undefined,
      phone: h.phone ?? undefined,
    })),
    timeSlots: (row.time_slots ?? [])
      .map<TimeSlot>((t) => ({
        id: t.id,
        sessionId: row.id,
        startsAt: t.starts_at,
        durationMinutes: t.duration_minutes,
        available: t.available,
      }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  };
}

function mapUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): ClientUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined,
  };
}

function publicUrl(bucket: string, path: string | null): string | undefined {
  if (!path) return undefined;
  return getSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function signedUrl(bucket: string, path: string, expiresInSeconds = 60 * 60): Promise<string> {
  const { data, error } = await getSupabase().storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export const supabaseApi: Api = {
  providerName: 'supabase',

  async listSessions() {
    const { data, error } = await getSupabase()
      .from('photo_sessions')
      .select(SESSION_SELECT)
      .eq('published', true)
      .order('start_date', { ascending: true });
    if (error) throw error;
    return (data as unknown as SessionRow[]).map(mapSession);
  },

  async getSession(id) {
    const { data, error } = await getSupabase()
      .from('photo_sessions')
      .select(SESSION_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSession(data as unknown as SessionRow) : null;
  },

  async listPortfolio() {
    const { data, error } = await getSupabase()
      .from('portfolio_images')
      .select('id, storage_path, caption, category, sort_order')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map<PortfolioImage>((row) => ({
      id: row.id,
      url: publicUrl('portfolio', row.storage_path) ?? '',
      caption: row.caption ?? undefined,
      category: row.category,
    }));
  },

  async requestBooking(request: BookingRequest) {
    // The RPC inserts the booking and marks the slot unavailable atomically.
    const { data, error } = await getSupabase().rpc('request_booking', {
      p_session_id: request.sessionId,
      p_time_slot_id: request.timeSlotId ?? null,
      p_parent_name: request.parentName,
      p_email: request.email,
      p_phone: request.phone,
      p_children: request.children,
      p_notes: request.notes ?? null,
    });
    if (error) throw error;
    return {
      ...request,
      id: data as string,
      createdAt: new Date().toISOString(),
      status: 'requested',
    };
  },

  async submitHostessApplication(application: HostessApplication) {
    const { error } = await getSupabase().from('hostess_applications').insert({
      name: application.name,
      email: application.email,
      phone: application.phone,
      city: application.city,
      state: application.state,
      preferred_season: application.preferredSeason,
      venue_idea: application.venueIdea ?? null,
      estimated_families: application.estimatedFamilies ?? null,
      message: application.message ?? null,
    });
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data } = await getSupabase().auth.getSession();
    return mapUser(data.session?.user ?? null);
  },

  async sendLoginCode(email) {
    const { error } = await getSupabase().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  },

  async verifyLoginCode(email, code) {
    const { data, error } = await getSupabase().auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'email',
    });
    if (error) throw error;
    const user = mapUser(data.user);
    if (!user) throw new Error('Sign in failed. Please try again.');
    return user;
  },

  async signOut() {
    await getSupabase().auth.signOut();
  },

  onAuthChange(callback) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      callback(mapUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  },

  async listGalleries() {
    const { data, error } = await getSupabase()
      .from('galleries')
      .select('id, title, session_date, cover_path, order_by, price_sheet_path, client_email, proofs(count)')
      .order('session_date', { ascending: false });
    if (error) throw error;
    return Promise.all(
      (data ?? []).map(async (row) => ({
        id: row.id,
        title: row.title,
        sessionDate: row.session_date,
        coverUrl: row.cover_path ? await signedUrl('proofs', row.cover_path) : undefined,
        proofCount: (row.proofs as unknown as { count: number }[])?.[0]?.count ?? 0,
        orderBy: row.order_by ?? undefined,
        priceSheetUrl: row.price_sheet_path ? await signedUrl('proofs', row.price_sheet_path) : undefined,
        clientEmail: row.client_email,
      }))
    );
  },

  async getGallery(id) {
    const galleries = await this.listGalleries();
    return galleries.find((g) => g.id === id) ?? null;
  },

  async listProofs(galleryId) {
    const supabase = getSupabase();
    const [{ data, error }, { data: favorites }] = await Promise.all([
      supabase
        .from('proofs')
        .select('id, gallery_id, label, thumbnail_path, full_path, width, height, sort_order')
        .eq('gallery_id', galleryId)
        .order('sort_order', { ascending: true }),
      supabase.from('favorites').select('proof_id'),
    ]);
    if (error) throw error;
    const favoriteIds = new Set((favorites ?? []).map((f) => f.proof_id as string));
    return Promise.all(
      (data ?? []).map(async (row) => ({
        id: row.id,
        galleryId: row.gallery_id,
        label: row.label,
        thumbnailUrl: await signedUrl('proofs', row.thumbnail_path),
        fullUrl: await signedUrl('proofs', row.full_path),
        width: row.width ?? undefined,
        height: row.height ?? undefined,
        isFavorite: favoriteIds.has(row.id),
      }))
    );
  },

  async setFavorite(proofId, favorite) {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) throw new Error('Sign in to save favorites.');
    if (favorite) {
      const { error } = await supabase.from('favorites').upsert({ proof_id: proofId, user_id: userId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('favorites').delete().eq('proof_id', proofId).eq('user_id', userId);
      if (error) throw error;
    }
  },

  async submitProofOrder(order: ProofOrderRequest) {
    const { error } = await getSupabase().from('proof_orders').insert({
      gallery_id: order.galleryId,
      items: order.items,
      notes: order.notes ?? null,
    });
    if (error) throw error;
  },

  async listMyBookings() {
    const { data, error } = await getSupabase()
      .from('bookings')
      .select(
        'id, session_id, time_slot_id, parent_name, email, phone, children, notes, status, created_at, photo_sessions(city, state, start_date), time_slots(id, starts_at, duration_minutes, available)'
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map<Booking>((row) => {
      const session = row.photo_sessions as unknown as { city: string; state: string; start_date: string } | null;
      const slot = row.time_slots as unknown as {
        id: string;
        starts_at: string;
        duration_minutes: number;
        available: boolean;
      } | null;
      return {
        id: row.id,
        sessionId: row.session_id,
        timeSlotId: row.time_slot_id ?? undefined,
        parentName: row.parent_name,
        email: row.email,
        phone: row.phone,
        children: row.children ?? [],
        notes: row.notes ?? undefined,
        status: row.status,
        createdAt: row.created_at,
        session: session ? { city: session.city, state: session.state, startDate: session.start_date } : undefined,
        timeSlot: slot
          ? {
              id: slot.id,
              sessionId: row.session_id,
              startsAt: slot.starts_at,
              durationMinutes: slot.duration_minutes,
              available: slot.available,
            }
          : undefined,
      };
    });
  },
};
