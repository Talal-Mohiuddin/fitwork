import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Profile } from "@/types";
import { uploadBase64ToStorage } from "@/lib/uploadToStorage";

export interface ProfileDraft extends Profile {
  status: "draft" | "submitted";
  savedAt: string;
  submittedAt?: string;
}

/**
 * Upload profile images (profile photo and gallery) to Firebase Storage
 * @param userId - User ID for storage path
 * @param profile - Profile data containing base64 images
 * @returns Profile with uploaded image URLs
 */
async function uploadProfileImages(
  userId: string,
  profile: Partial<Profile>
): Promise<Partial<Profile>> {
  const updatedProfile = { ...profile };

  try {
    // Upload profile photo if it's a base64 string
    if (
      updatedProfile.profile_photo &&
      updatedProfile.profile_photo.startsWith("data:image")
    ) {
      console.log("Uploading profile photo...");
      const photoPath = `instructors/${userId}/profile_photo_${Date.now()}.jpg`;
      const photoURL = await uploadBase64ToStorage(
        updatedProfile.profile_photo,
        photoPath
      );
      updatedProfile.profile_photo = photoURL;
      console.log("Profile photo uploaded:", photoURL);
    }

    // Upload gallery images if they're base64 strings
    if (updatedProfile.gallery_images && updatedProfile.gallery_images.length > 0) {
      console.log("Uploading gallery images...");
      const uploadedGalleryImages: string[] = [];

      for (let i = 0; i < updatedProfile.gallery_images.length; i++) {
        const img = updatedProfile.gallery_images[i];
        if (img.startsWith("data:image")) {
          const galleryPath = `instructors/${userId}/gallery_${Date.now()}_${i}.jpg`;
          const imgURL = await uploadBase64ToStorage(img, galleryPath);
          uploadedGalleryImages.push(imgURL);
          console.log(`Gallery image ${i + 1} uploaded:`, imgURL);
        } else {
          // Already a URL, keep it
          uploadedGalleryImages.push(img);
        }
      }

      updatedProfile.gallery_images = uploadedGalleryImages;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Failed to upload images");
  }
}

/**
 * Save instructor profile as draft
 */
export async function saveProfileDraft(
  userId: string,
  profile: Partial<Profile>
): Promise<void> {
  try {
    console.log("Starting draft save...");
    
    // Upload images first to avoid base64 in Firestore
    const profileWithUrls = await uploadProfileImages(userId, profile);
    
    const profileRef = doc(db, "instructors", userId);
    const profileData: Partial<ProfileDraft> = {
      ...profileWithUrls,
      status: "draft",
      savedAt: new Date().toISOString(),
    };

    // Check if profile exists
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      // Update existing draft
      console.log("Updating existing draft...");
      await updateDoc(profileRef, {
        ...profileData,
        updated_at: serverTimestamp(),
      });
    } else {
      // Create new draft
      console.log("Creating new draft...");
      await setDoc(profileRef, {
        ...profileData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    console.log("Profile saved as draft successfully");
  } catch (error) {
    console.error("Error saving draft:", error);
    throw new Error("Failed to save profile draft");
  }
}

/**
 * Submit instructor profile for review
 */
export async function submitProfile(
  userId: string,
  profile: Partial<Profile>
): Promise<void> {
  try {
    console.log("Starting profile submission...");
    
    // Validate required fields
    if (!profile.full_name || profile.full_name.trim().length === 0) {
      throw new Error("Full name is required");
    }
    if (!profile.headline || profile.headline.length < 10) {
      throw new Error("Headline must be at least 10 characters");
    }
    if (!profile.location || profile.location.trim().length === 0) {
      throw new Error("Location is required");
    }
    if (!profile.bio || profile.bio.length < 60) {
      throw new Error("Bio must be at least 60 characters");
    }
    if (!profile.experience || profile.experience.length === 0) {
      throw new Error("Please add at least one work experience");
    }
    if (!profile.availability_slots || profile.availability_slots.length === 0) {
      throw new Error("Please set your availability");
    }
    if (!profile.certifications || profile.certifications.length === 0) {
      throw new Error("Please select at least one certification");
    }
    if (!profile.fitness_styles || profile.fitness_styles.length === 0) {
      throw new Error("Please select at least one fitness style");
    }

    // Upload images first to avoid base64 in Firestore
    const profileWithUrls = await uploadProfileImages(userId, profile);

    const profileRef = doc(db, "instructors", userId);
    const profileData: Partial<ProfileDraft> = {
      ...profileWithUrls,
      status: "submitted",
      submittedAt: new Date().toISOString(),
      profile_completed: true,
    };

    // Check if profile exists
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      // Update existing profile
      console.log("Updating existing profile...");
      await updateDoc(profileRef, {
        ...profileData,
        updated_at: serverTimestamp(),
      });
    } else {
      // Create new profile
      console.log("Creating new profile...");
      await setDoc(profileRef, {
        ...profileData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    console.log("Profile submitted successfully");
  } catch (error) {
    console.error("Error submitting profile:", error);
    throw error;
  }
}

/**
 * Get instructor profile
 */
export async function getInstructorProfile(userId: string): Promise<Profile | null> {
  try {
    const profileRef = doc(db, "instructors", userId);
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      return profileSnapshot.data() as Profile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

/**
 * Get all instructor profiles (for admin/discovery)
 */
export async function getSubmittedProfiles(): Promise<Profile[]> {
  try {
    const q = query(
      collection(db, "instructors"),
      where("status", "==", "submitted"),
      where("user_type", "==", "instructor")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Profile);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw new Error("Failed to fetch profiles");
  }
}

/**
 * Delete instructor profile
 */
export async function deleteInstructorProfile(userId: string): Promise<void> {
  try {
    const profileRef = doc(db, "instructors", userId);
    // For deletion, we could use deleteDoc or just set status to archived
    // For safety, let's just archive it
    await updateDoc(profileRef, {
      status: "archived",
      updated_at: serverTimestamp(),
    });

    console.log("Profile archived successfully");
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw new Error("Failed to delete profile");
  }
}
