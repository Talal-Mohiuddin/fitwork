"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { ReactNode } from "react";
import { auth, db } from "@/firebase";
import { useStore } from "./zustand";
import { doc, getDoc } from "firebase/firestore";
import type { Profile } from "@/types";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUser: setStoreUser, clearAuth } = useStore();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Fetch user profile from Firestore
          try {
            const profileRef = doc(db, "profiles", firebaseUser.uid);
            const profileDoc = await getDoc(profileRef);
            
            if (profileDoc.exists()) {
              const profileData = profileDoc.data() as Profile;
              setProfile(profileData);
              setStoreUser(profileData);
            } else {
              // User exists in Firebase Auth but not in Firestore
              // This might happen if profile creation failed
              setProfile(null);
            }
          } catch (profileError: any) {
            console.error("Error fetching profile:", profileError);
            setError(profileError.message || "Error fetching profile");
          }
        } else {
          setProfile(null);
          clearAuth();
        }
        
        setLoading(false);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || "Authentication error");
      setLoading(false);
    }
  }, [setStoreUser, clearAuth]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      clearAuth();
    } catch (err: any) {
      setError(err.message || "Sign out error");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
