"use client";

import { auth, db, googleProvider } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { Profile, mode } from "@/types";

export interface AuthResult {
  success: boolean;
  message: string;
  user: Profile | null;
  requiresEmailVerification?: boolean;
  requiresRoleSelection?: boolean;
  isNewUser?: boolean;
}

export default async function LoginAction(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    if (!email || !password) {
      return {
        success: false,
        message: "Please enter both email and password",
        user: null,
      };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        user: null,
        requiresEmailVerification: true,
      };
    }

    // Fetch user profile from Firestore
    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    
    if (!profileDoc.exists()) {
      return {
        success: false,
        message: "Profile not found. Please complete your signup.",
        user: null,
      };
    }

    const profile = profileDoc.data() as Profile;

    return {
      success: true,
      message: "Login successful",
      user: profile,
    };
  } catch (error: any) {
    console.error("Login failed:", error);
    
    // Handle specific Firebase errors
    let errorMessage = "Login failed";
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email address";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Incorrect password";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password";
    }
    
    return {
      success: false,
      message: errorMessage,
      user: null,
    };
  }
}

export async function GoogleLoginAction(): Promise<AuthResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists
    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    
    if (profileDoc.exists()) {
      const profile = profileDoc.data() as Profile;
      return {
        success: true,
        message: "Google login successful",
        user: profile,
      };
    } else {
      // New user via Google - they need to select a role
      return {
        success: true,
        message: "Please select your role to continue",
        user: null,
        requiresRoleSelection: true,
        isNewUser: true,
      };
    }
  } catch (error: any) {
    console.error("Google login failed:", error);
    
    let errorMessage = "Google login failed";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in popup was closed";
    } else if (error.code === "auth/cancelled-popup-request") {
      errorMessage = "Sign-in was cancelled";
    }
    
    return {
      success: false,
      message: errorMessage,
      user: null,
    };
  }
}

export async function createGoogleUserProfile(
  role: mode
): Promise<AuthResult> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: "No authenticated user found",
        user: null,
      };
    }

    const profile: Profile = {
      id: user.uid,
      email: user.email || "",
      user_type: role,
      created_at: new Date().toISOString(),
      profile_completed: false,
      full_name: user.displayName || "",
    };

    await setDoc(doc(db, "profiles", user.uid), {
      ...profile,
      created_at: serverTimestamp(),
    });

    return {
      success: true,
      message: "Profile created successfully",
      user: profile,
    };
  } catch (error: any) {
    console.error("Failed to create profile:", error);
    return {
      success: false,
      message: error.message || "Failed to create profile",
      user: null,
    };
  }
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Please enter your email address",
      };
    }

    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: "Password reset email sent. Check your inbox.",
    };
  } catch (error: any) {
    console.error("Password reset failed:", error);
    
    let errorMessage = "Failed to send password reset email";
    if (error.code === "auth/user-not-found") {
      errorMessage = "No account found with this email address";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}
