// Supabase client for Recipe Labs
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  title?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  agency_core_competency?: string;
  primary_client_industry?: string;
  settings?: {
    notifications: boolean;
    emailDigest: boolean;
    theme: 'dark' | 'light';
    timezone?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  agency_brand_voice?: string;
  target_location?: string;
  ideal_client_profile?: string;
  client_work_examples?: string;
  primary_goals?: string[];
  success_metric?: string;
  platform_theme?: string;
  tool_layout?: string;
  is_premium: boolean;
  credits: number;
  total_tools_used: number;
  has_completed_onboarding: boolean;
  theme_mode: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const authService = {
  // Sign up a new user
  async signUp(email: string, password: string, userData: Partial<DbUser>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar,
          department: userData.department,
          agency_core_competency: userData.agency_core_competency,
          primary_client_industry: userData.primary_client_industry,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Create profile record
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        is_premium: true,
        credits: 1000,
        total_tools_used: 0,
        has_completed_onboarding: false,
        theme_mode: 'dark'
      });
    }

    return { success: true, user: data.user };
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message };
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error: error?.message };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error: error?.message };
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<DbProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error: error?.message };
  },

  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error: error?.message };
  },

  // Update user metadata
  async updateUserMetadata(updates: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    return { user: data.user, error: error?.message };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default supabase;
