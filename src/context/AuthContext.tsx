import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  isBackendConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const isBackendConnected = isSupabaseConfigured();

  // Helper to verify admin role against admin_users table
  const verifyAdminRole = async (userId: string | undefined): Promise<boolean> => {
    if (!userId || !isBackendConnected) return false;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) return false;
      return data.role === 'admin';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isBackendConnected) {
      // Offline/local fallback: allow prototype inspection
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await verifyAdminRole(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await verifyAdminRole(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isBackendConnected]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isBackendConnected) {
      return {
        success: false,
        error: 'Supabase credentials are not yet configured in .env. Please configure VITE_SUPABASE_URL.',
      };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const hasAdminRole = await verifyAdminRole(data.user.id);
      if (!hasAdminRole) {
        await supabase.auth.signOut();
        setLoading(false);
        return {
          success: false,
          error: 'Access Denied: Your account does not have administrator privileges in admin_users.',
        };
      }

      setIsAdmin(true);
      setUser(data.user);
      setSession(data.session);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication error occurred.' };
    }
  };

  const signOut = async (): Promise<void> => {
    if (isBackendConnected) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        isBackendConnected,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
