"use server";

import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { Profile } from "@/types"; // Import your Profile type

export default async function LoginAction(email: string, password: string) {
  try {
    if (!email || !password) {
      throw new Error("Please enter both email and password");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const profile = (profileDoc.data() as Profile) || null;

    return {
      success: true,
      message: "Login successful",
      user: profile,
    };
  } catch (error: any) {
    console.error("Login failed:", error);
    return {
      success: false,
      message: error.message || "Login failed",
      user: null,
    };
  }
}

export async function GoogleLoginAction() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const profile = (profileDoc.data() as Profile) || null;

    return {
      success: true,
      message: "Google login successful",
      user: profile,
    };
  } catch (error: any) {
    console.error("Google login failed:", error);
    return {
      success: false,
      message: error.message || "Google login failed",
      user: null,
    };
  }
}
