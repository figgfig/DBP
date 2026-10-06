import { demoApi } from './demo';
import { supabaseApi } from './supabase';
import { supabaseAnonKey, supabaseUrl } from './supabase-client';
import type { Api } from './types';

/**
 * The app runs against Supabase when EXPO_PUBLIC_SUPABASE_URL and
 * EXPO_PUBLIC_SUPABASE_ANON_KEY are set, otherwise it runs in demo mode
 * with sample data so the whole app can be exercised without a backend.
 */
export const api: Api = supabaseUrl && supabaseAnonKey ? supabaseApi : demoApi;
export type { Api } from './types';
