import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase isn't configured, allow demo mode (no auth required)
    if (!isSupabaseConfigured) {
      setLoading(false);
      setIsAuthenticated(true); // Allow access in demo mode
      setUser({ id: 'demo-user', email: 'demo@example.com' }); // Demo user object
      return;
    }

    // Check if user is already logged in
    checkUser();

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setLoading(false);
      return () => {};
    }
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase to use this feature. See SUPABASE_SETUP.md for instructions.' 
        } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase to use this feature. See SUPABASE_SETUP.md for instructions.' 
        } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    signUp,
    signIn,
    logout,
    userEmail: user?.email || '',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
