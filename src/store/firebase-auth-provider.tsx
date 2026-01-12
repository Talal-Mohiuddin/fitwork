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
            let profileData: Profile | null = null;
            
            // 1. Try 'profiles' collection first (base user data)
            const profileRef = doc(db, "profiles", firebaseUser.uid);
            const profileDoc = await getDoc(profileRef);
            
            if (profileDoc.exists()) {
              const baseProfile = profileDoc.data() as Profile;
              profileData = baseProfile;
              
              // 2. Fetch extended data based on user_type
              if (baseProfile.user_type === 'instructor') {
                const instructorRef = doc(db, "instructors", firebaseUser.uid);
                const instructorDoc = await getDoc(instructorRef);
                if (instructorDoc.exists()) {
                  profileData = { ...baseProfile, ...instructorDoc.data() };
                }
              } else if (baseProfile.user_type === 'studio') {
                const studioRef = doc(db, "studios", firebaseUser.uid);
                const studioDoc = await getDoc(studioRef);
                 if (studioDoc.exists()) {
                  profileData = { ...baseProfile, ...studioDoc.data() };
                }
              }
            } else {
              // 3. Fallback: Check specific collections directly if base profile is missing
              // Try instructor first
              const instructorRef = doc(db, "instructors", firebaseUser.uid);
              const instructorDoc = await getDoc(instructorRef);
              
              if (instructorDoc.exists()) {
                profileData = instructorDoc.data() as Profile;
                // Ensure user_type is set if missing
                if (!profileData.user_type) profileData.user_type = 'instructor';
              } else {
                // Try studio
                const studioRef = doc(db, "studios", firebaseUser.uid);
                const studioDoc = await getDoc(studioRef);
                
                if (studioDoc.exists()) {
                  profileData = studioDoc.data() as Profile;
                  if (!profileData.user_type) profileData.user_type = 'studio';
                }
              }
            }

            if (profileData) {
              setProfile(profileData);
              setStoreUser(profileData);
            } else {
              // User exists in Firebase Auth but not in any Firestore collection
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
