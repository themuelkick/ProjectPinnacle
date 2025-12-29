import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debugging log to track state changes in the console
  console.log("Auth State Update:", { user: !!user, loading, profile: !!profile });

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn("Profile fetch issue (normal for new users):", error.message);
      }
      if (data) setProfile(data);
    } catch (err) {
      console.error("Critical Auth Error:", err);
    } finally {
      // Safety Switch: Ensure loading stops even if profile fetch fails
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Session Check on Mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event Triggered:", event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
  try {
    // 1. Try to tell Supabase
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign Out Error:", error);
  } finally {
    // 2. ALWAYS clear local state even if network fails
    setUser(null);
    setProfile(null);
    localStorage.clear(); // This kills the "SIGNED_IN" auto-trigger
    console.log("Local state cleared.");
  }
};

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);