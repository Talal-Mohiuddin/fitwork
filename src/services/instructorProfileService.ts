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
import { 
  uploadBase64ToCloudinary, 
  isBase64Image, 
  isCloudinaryUrl 
} from "@/lib/cloudinary";

export interface ProfileDraft extends Profile {
  status: "draft" | "submitted" | "archived";
  savedAt: string;
  submittedAt?: string;
}

/**
 * Upload profile images to Cloudinary and return URLs for Firebase storage
 * @param userId - User ID for folder organization
 * @param profile - Profile data containing base64 images
 * @returns Profile with Cloudinary image URLs
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
      isBase64Image(updatedProfile.profile_photo)
    ) {
      console.log("Uploading profile photo to Cloudinary...");
      const result = await uploadBase64ToCloudinary(
        updatedProfile.profile_photo,
        `fitwork/instructors/${userId}/profile`
      );
      updatedProfile.profile_photo = result.secure_url;
      console.log("Profile photo uploaded:", result.secure_url);
    }

    // Upload gallery images if they're base64 strings
    if (updatedProfile.gallery_images && updatedProfile.gallery_images.length > 0) {
      console.log("Uploading gallery images to Cloudinary...");
      const uploadedGalleryImages: string[] = [];

      for (let i = 0; i < updatedProfile.gallery_images.length; i++) {
        const img = updatedProfile.gallery_images[i];
        if (isBase64Image(img)) {
          const result = await uploadBase64ToCloudinary(
            img,
            `fitwork/instructors/${userId}/gallery`
          );
          uploadedGalleryImages.push(result.secure_url);
          console.log(`Gallery image ${i + 1} uploaded:`, result.secure_url);
        } else if (isCloudinaryUrl(img) || img.startsWith("http")) {
          // Already a URL, keep it
          uploadedGalleryImages.push(img);
        }
      }

      updatedProfile.gallery_images = uploadedGalleryImages;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error uploading images to Cloudinary:", error);
    throw new Error("Failed to upload images. Please check your Cloudinary configuration.");
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

    // Sanitize data
    const sanitizedData = { ...profileData };
    Object.keys(sanitizedData).forEach(key => {
      // @ts-ignore
      if (sanitizedData[key] === undefined) sanitizedData[key] = null;
    });

    // Check if profile exists
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      // Update existing draft
      console.log("Updating existing draft...");
      await updateDoc(profileRef, {
        ...sanitizedData,
        updated_at: serverTimestamp(),
      });
    } else {
      // Create new draft
      console.log("Creating new draft...");
      await setDoc(profileRef, {
        ...sanitizedData,
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

    // Sanitize data
    const sanitizedData = { ...profileData };
    Object.keys(sanitizedData).forEach(key => {
      // @ts-ignore
      if (sanitizedData[key] === undefined) sanitizedData[key] = null;
    });

    // Check if profile exists
    const profileSnapshot = await getDoc(profileRef);

    if (profileSnapshot.exists()) {
      // Update existing profile
      console.log("Updating existing profile...");
      await updateDoc(profileRef, {
        ...sanitizedData,
        updated_at: serverTimestamp(),
      });
    } else {
      // Create new profile
      console.log("Creating new profile...");
      await setDoc(profileRef, {
        ...sanitizedData,
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
      const profileData = profileSnapshot.data() as Profile;
      
      // Also get user data from "users" collection to get the auth email
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);
      
      let authEmail = profileData.email;
      let userName = profileData.full_name;
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        // Use auth email if available
        if (userData.email) {
          authEmail = userData.email;
        }
        // Use user's full name as fallback
        if (!userName && userData.full_name) {
          userName = userData.full_name;
        }
      }
      
      return {
        ...profileData,
        id: userId,
        email: authEmail,
        full_name: userName || profileData.full_name,
      };
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
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Profile));
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw new Error("Failed to fetch profiles");
  }
}

/**
 * Check if instructor has a completed/submitted profile
 * @param userId - The user's Firebase UID
 * @returns Object with hasProfile and profile status
 */
export async function checkInstructorProfileStatus(userId: string): Promise<{
  hasProfile: boolean;
  isSubmitted: boolean;
  isDraft: boolean;
  profile: Profile | null;
}> {
  try {
    const profileRef = doc(db, "instructors", userId);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return {
        hasProfile: false,
        isSubmitted: false,
        isDraft: false,
        profile: null,
      };
    }

    const profileData = { ...profileSnapshot.data(), id: profileSnapshot.id } as ProfileDraft;
    
    return {
      hasProfile: true,
      isSubmitted: profileData.status === "submitted",
      isDraft: profileData.status === "draft",
      profile: profileData,
    };
  } catch (error) {
    console.error("Error checking profile status:", error);
    return {
      hasProfile: false,
      isSubmitted: false,
      isDraft: false,
      profile: null,
    };
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
