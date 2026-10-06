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
} from '@/lib/types';

/**
 * Every data provider (demo or Supabase) implements this interface, so
 * screens never know where data comes from.
 */
export interface Api {
  readonly providerName: 'demo' | 'supabase';

  // Public content
  listSessions(): Promise<PhotoSession[]>;
  getSession(id: string): Promise<PhotoSession | null>;
  listPortfolio(): Promise<PortfolioImage[]>;

  // Requests from the public
  requestBooking(request: BookingRequest): Promise<Booking>;
  submitHostessApplication(application: HostessApplication): Promise<void>;

  // Client authentication (email one-time code)
  getCurrentUser(): Promise<ClientUser | null>;
  sendLoginCode(email: string): Promise<void>;
  verifyLoginCode(email: string, code: string): Promise<ClientUser>;
  signOut(): Promise<void>;
  onAuthChange(callback: (user: ClientUser | null) => void): () => void;

  // Client proofs (requires a signed-in user)
  listGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery | null>;
  listProofs(galleryId: string): Promise<Proof[]>;
  setFavorite(proofId: string, favorite: boolean): Promise<void>;
  submitProofOrder(order: ProofOrderRequest): Promise<void>;
  listMyBookings(): Promise<Booking[]>;
}
