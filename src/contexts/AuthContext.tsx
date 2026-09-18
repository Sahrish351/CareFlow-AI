import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { DEMO_PROFILES } from '../services/mockData';
import { supabase } from '../lib/supabase/client';

interface SignUpExtra {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  specialty?: string;
  experienceYears?: number;
  hospitalId?: string;
  bio?: string;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, extra?: SignUpExtra) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'careflow_active_user_profile_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to null for guest visitors, or persisted user if previously signed in
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check Supabase session if present
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          }
        }
      } catch (err) {
        // Continue with local persistent profile
      }
    };

    checkSupabaseAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setUser(profile as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          }
        } catch {
          // ignore
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) {
            setUser(profile as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            setLoading(false);
            return;
          }
        }
      }

      // Quick demo match
      const matched = Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
      } else {
        // Create generic patient
        const newProfile: Profile = {
          id: `u-${Date.now()}`,
          role: 'patient',
          full_name: email.split('@')[0],
          email,
          phone: '+92 (300) 123-4567',
        };
        setUser(newProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, extra?: SignUpExtra) => {
    setLoading(true);
    try {
      let userId = `u-${Date.now()}`;
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } }
        });
        if (!error && data.user) {
          userId = data.user.id;
          await supabase.from('profiles').insert({
            id: userId,
            full_name: fullName,
            email,
            role,
            phone: extra?.phone,
            date_of_birth: extra?.dateOfBirth,
            gender: extra?.gender
          });
        }
      } catch {
        // Fallback to local profile
      }

      const newProfile: Profile = {
        id: userId,
        role,
        full_name: fullName,
        email,
        phone: extra?.phone || '+92 (300) 987-6543',
        date_of_birth: extra?.dateOfBirth,
        gender: extra?.gender,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
      };
      setUser(newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));

      // If doctor registers, save to local DOCTORS registry as pending approval
      if (role === 'doctor') {
        try {
          const docsKey = 'careflow_doctors_v2';
          const existing = JSON.parse(localStorage.getItem(docsKey) || '[]');
          const newDoc = {
            id: `doc-${Date.now()}`,
            profile_id: userId,
            hospital_id: extra?.hospitalId || 'hosp-lahore-1',
            specialty: extra?.specialty || 'General Medicine',
            bio: extra?.bio || 'Newly registered specialist undergoing clinical review.',
            experience_years: extra?.experienceYears || 5,
            consultation_fee: 150,
            available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            is_active: true,
            is_approved: false, // Requires Admin Verification!
            rating: 4.8,
            review_count: 0,
            languages: ['English', 'Urdu'],
            education: 'MBBS (Pending Verification)',
            profile: newProfile,
            created_at: new Date().toISOString()
          };
          existing.unshift(newDoc);
          localStorage.setItem(docsKey, JSON.stringify(existing));
        } catch (e) {
          console.warn('Error saving new doctor profile:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (e) {
      console.warn('Supabase password reset note:', e);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string): Promise<void> => {
    setLoading(true);
    try {
      await supabase.auth.updateUser({ password });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const demoProfile = DEMO_PROFILES[targetRole];
    if (demoProfile) {
      setUser(demoProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoProfile));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));

    try {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    } catch {
      // Fallback updated locally
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'patient',
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

