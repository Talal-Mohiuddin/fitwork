"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import type { Profile, mode } from "@/types";

// For magic link, we use Firebase's email link authentication
// This requires configuration in Firebase Console:
// 1. Enable Email/Password sign-in method
// 2. Enable Email link (passwordless sign-in)

export async function sendMagicLinkAction(
  email: string,
  userType?: mode,
  authType: "login" | "register" = "login"
) {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required",
      };
    }

    // Store pending registration data in Firestore for magic link completion
    // This will be retrieved when user clicks the magic link
    if (authType === "register" && userType) {
      await setDoc(doc(db, "pending_registrations", email), {
        email,
        user_type: userType,
        created_at: serverTimestamp(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    }

    // Return success - the actual email sending happens on the client
    // because Firebase email link requires client-side sendSignInLinkToEmail
    return {
      success: true,
      message: "Magic link request processed",
      authType,
      userType,
    };
  } catch (error: any) {
    console.error("Magic link error:", error);
    return {
      success: false,
      message: error.message || "Failed to process magic link request",
    };
  }
}

export async function signInWithGoogleAction(
  uid: string,
  email: string,
  displayName: string,
  userType?: mode
) {
  try {
    // Check if user already exists in Firestore
    const profileRef = doc(db, "profiles", uid);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      // Existing user - return their profile
      const profile = profileDoc.data() as Profile;
      return {
        success: true,
        message: "Signed in successfully",
        user: {
          ...profile,
          created_at: profile.created_at || new Date().toISOString(),
        },
        isNewUser: false,
      };
    }

    // New user - create profile
    if (!userType) {
      // Default to instructor if no user type specified during login
      userType = "instructor";
    }

    const newProfile: Profile = {
      id: uid,
      email: email,
      full_name: displayName,
      user_type: userType,
      created_at: new Date().toISOString(),
      profile_completed: false,
    };

    await setDoc(profileRef, {
      ...newProfile,
      created_at: serverTimestamp(),
    });

    return {
      success: true,
      message: "Account created successfully",
      user: newProfile,
      isNewUser: true,
    };
  } catch (error: any) {
    console.error("Google sign-in server action error:", error);
    return {
      success: false,
      message: error.message || "Failed to complete sign in",
      user: null,
      isNewUser: false,
    };
  }
}

export async function completeMagicLinkSignIn(
  uid: string,
  email: string
) {
  try {
    // Check if user already exists
    const profileRef = doc(db, "profiles", uid);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      // Existing user
      const profile = profileDoc.data() as Profile;
      return {
        success: true,
        message: "Signed in successfully",
        user: {
          ...profile,
          created_at: profile.created_at || new Date().toISOString(),
        },
        isNewUser: false,
      };
    }

    // Check for pending registration
    const pendingRef = doc(db, "pending_registrations", email);
    const pendingDoc = await getDoc(pendingRef);

    let userType: mode = "instructor"; // default
    
    if (pendingDoc.exists()) {
      const pendingData = pendingDoc.data();
      userType = pendingData.user_type || "instructor";
      
      // Clean up pending registration
      // Note: In production, you might want to use a Cloud Function for cleanup
    }

    // Create new profile
    const newProfile: Profile = {
      id: uid,
      email: email,
      user_type: userType,
      created_at: new Date().toISOString(),
      profile_completed: false,
    };

    await setDoc(profileRef, {
      ...newProfile,
      created_at: serverTimestamp(),
    });

    return {
      success: true,
      message: "Account created successfully",
      user: newProfile,
      isNewUser: true,
    };
  } catch (error: any) {
    console.error("Complete magic link sign-in error:", error);
    return {
      success: false,
      message: error.message || "Failed to complete sign in",
      user: null,
      isNewUser: false,
    };
  }
}

export async function getUserProfile(uid: string) {
  try {
    const profileRef = doc(db, "profiles", uid);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      const profile = profileDoc.data() as Profile;
      return {
        success: true,
        user: {
          ...profile,
          created_at: profile.created_at || new Date().toISOString(),
        },
      };
    }

    return {
      success: false,
      user: null,
      message: "Profile not found",
    };
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      user: null,
      message: error.message || "Failed to get profile",
    };
  }
}
