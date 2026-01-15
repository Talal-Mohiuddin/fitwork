"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase";
import { Profile, mode } from "@/types";

export interface SignupResult {
  success: boolean;
  message: string;
  user: Profile | null;
  requiresEmailVerification?: boolean;
  requiresRoleSelection?: boolean;
  isNewUser?: boolean;
}

export async function signupAction(
  email: string,
  password: string,
  userType: mode,
  additionalFields: Partial<Profile>
): Promise<SignupResult> {
  try {
    if (!email || !password) {
      return {
        success: false,
        message: "Please enter both email and password",
        user: null,
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters",
        user: null,
      };
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: false,
    });

    // Create user profile in Firestore
    const profile: Profile = {
      id: user.uid,
      email: user.email || "",
      user_type: userType,
      created_at: new Date().toISOString(),
      profile_completed: false,
      ...additionalFields,
    };

    await setDoc(doc(db, "profiles", user.uid), {
      ...profile,
      created_at: serverTimestamp(),
    });

    return {
      success: true,
      message: "Account created! Please check your email to verify your account before logging in.",
      user: profile,
      requiresEmailVerification: true,
    };
  } catch (error: any) {
    console.error("Signup failed:", error);

    // Handle specific Firebase errors
    let errorMessage = "Signup failed";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "An account with this email already exists";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Use at least 6 characters";
    }

    return {
      success: false,
      message: errorMessage,
      user: null,
    };
  }
}

export async function googleSignupAction(): Promise<SignupResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile already exists
    const profileDoc = await getDoc(doc(db, "profiles", user.uid));

    if (profileDoc.exists()) {
      const profile = profileDoc.data() as Profile;
      return {
        success: true,
        message: "Welcome back! You already have an account.",
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
    console.error("Google signup failed:", error);

    let errorMessage = "Google signup failed";
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-up popup was closed";
    } else if (error.code === "auth/cancelled-popup-request") {
      errorMessage = "Sign-up was cancelled";
    }

    return {
      success: false,
      message: errorMessage,
      user: null,
    };
  }
}

export async function createGoogleUserProfile(
  role: mode,
  additionalFields?: Partial<Profile>
): Promise<SignupResult> {
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
      ...additionalFields,
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

export async function resendVerificationEmail(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "No authenticated user found. Please sign up again.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "Your email is already verified. You can log in now.",
      };
    }

    await sendEmailVerification(user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: false,
    });

    return {
      success: true,
      message: "Verification email sent! Check your inbox.",
    };
  } catch (error: any) {
    console.error("Failed to resend verification email:", error);

    let errorMessage = "Failed to send verification email";
    if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
