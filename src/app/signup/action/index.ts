"use server";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { Profile, mode } from "@/types";

export async function signupAction(
  email: string,
  password: string,
  userType: mode,
  additionalFields: Partial<Profile>
) {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile in Firestore
    const profile: Profile = {
      id: user.uid,
      email: user.email || "",
      user_type: userType,
      created_at: serverTimestamp() as any,
      profile_completed: false,
      ...additionalFields,
    };

    await setDoc(doc(db, "profiles", user.uid), profile);

    // Convert the profile to a plain object for client serialization
    const serializedProfile = {
      ...profile,
      created_at: new Date().toISOString(), // Convert to ISO string
    };

    return {
      success: true,
      message: "Signup successful",
      user: serializedProfile,
    };
  } catch (error: any) {
    console.error("Signup failed:", error);
    return {
      success: false,
      message: error.message || "Signup failed",
      user: null,
    };
  }
}
