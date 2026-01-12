import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  DocumentSnapshot,
  QueryConstraint,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Profile, StudioClaimToken, StudioDetails } from "@/types";
import { uploadBase64ToStorage } from "@/lib/uploadToStorage";

// Collections
const STUDIOS_COLLECTION = "studios";
const PROFILES_COLLECTION = "profiles";
const STUDIO_CLAIM_TOKENS_COLLECTION = "studio_claim_tokens";

export interface StudioFilters {
  location?: string;
  styles?: string[];
  amenities?: string[];
  hiringTypes?: string[];
  minRating?: number;
  sortBy?: "rating" | "recent" | "name" | "views";
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}

/**
 * Create or update a studio profile
 */
export async function saveStudioProfile(
  studioId: string,
  profile: Partial<Profile>,
  isDraft: boolean = false
): Promise<void> {
  try {
    // Upload images if they're base64
    const updatedProfile = await uploadStudioImages(studioId, profile);

    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const existingDoc = await getDoc(studioRef);

    const profileData = {
      ...updatedProfile,
      user_type: "studio" as const,
      status: isDraft ? "draft" : "submitted",
      profile_completed: !isDraft,
      updated_at: serverTimestamp(),
    };

    if (existingDoc.exists()) {
      await updateDoc(studioRef, profileData);
    } else {
      await setDoc(studioRef, {
        ...profileData,
        created_at: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error saving studio profile:", error);
    throw new Error("Failed to save studio profile");
  }
}

/**
 * Upload studio images to Firebase Storage
 */
async function uploadStudioImages(
  studioId: string,
  profile: Partial<Profile>
): Promise<Partial<Profile>> {
  const updatedProfile = { ...profile };

  try {
    // Upload main images if they're base64 strings
    if (updatedProfile.images && updatedProfile.images.length > 0) {
      const uploadedImages: string[] = [];

      for (let i = 0; i < updatedProfile.images.length; i++) {
        const img = updatedProfile.images[i];
        if (img.startsWith("data:image")) {
          const imagePath = `studios/${studioId}/image_${Date.now()}_${i}.jpg`;
          const imgURL = await uploadBase64ToStorage(img, imagePath);
          uploadedImages.push(imgURL);
        } else {
          uploadedImages.push(img);
        }
      }

      updatedProfile.images = uploadedImages;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Error uploading studio images:", error);
    throw new Error("Failed to upload images");
  }
}

/**
 * Get a single studio profile by ID
 */
export async function getStudioById(studioId: string): Promise<Profile | null> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const studioSnap = await getDoc(studioRef);

    if (!studioSnap.exists()) {
      return null;
    }

    return {
      ...studioSnap.data(),
      id: studioSnap.id,
    } as Profile;
  } catch (error) {
    console.error("Error fetching studio:", error);
    throw new Error("Failed to fetch studio");
  }
}

/**
 * Get all studios with optional filters
 */
export async function getStudios(
  filters?: StudioFilters
): Promise<{ studios: Profile[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [];

    // Only get completed profiles
    constraints.push(where("profile_completed", "==", true));
    constraints.push(where("user_type", "==", "studio"));

    // Sort options
    switch (filters?.sortBy) {
      case "rating":
        constraints.push(orderBy("rating", "desc"));
        break;
      case "name":
        constraints.push(orderBy("name", "asc"));
        break;
      case "views":
        constraints.push(orderBy("view_count", "desc"));
        break;
      case "recent":
      default:
        constraints.push(orderBy("created_at", "desc"));
        break;
    }

    // Pagination
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    if (filters?.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    const studiosQuery = query(
      collection(db, STUDIOS_COLLECTION),
      ...constraints
    );
    const snapshot = await getDocs(studiosQuery);

    let studios: Profile[] = snapshot.docs.map(
      (docSnap) =>
        ({
          ...docSnap.data(),
          id: docSnap.id,
        } as Profile)
    );

    // Client-side filtering for complex queries
    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      studios = studios.filter((studio) =>
        studio.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters?.styles && filters.styles.length > 0) {
      studios = studios.filter((studio) =>
        studio.styles?.some((style) => filters.styles!.includes(style))
      );
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      studios = studios.filter((studio) =>
        studio.amenities?.some((amenity) =>
          filters.amenities!.includes(amenity)
        )
      );
    }

    if (filters?.hiringTypes && filters.hiringTypes.length > 0) {
      studios = studios.filter((studio) =>
        studio.hiring_types?.some((type) => filters.hiringTypes!.includes(type))
      );
    }

    if (filters?.minRating) {
      studios = studios.filter(
        (studio) => (studio.rating || 0) >= filters.minRating!
      );
    }

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { studios, lastDoc };
  } catch (error) {
    console.error("Error fetching studios:", error);
    throw new Error("Failed to fetch studios");
  }
}

/**
 * Subscribe to real-time studio updates
 */
export function subscribeToStudios(
  callback: (studios: Profile[]) => void,
  filters?: { limitCount?: number }
): () => void {
  const constraints: QueryConstraint[] = [];

  constraints.push(where("profile_completed", "==", true));
  constraints.push(where("user_type", "==", "studio"));
  constraints.push(orderBy("created_at", "desc"));

  if (filters?.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  const studiosQuery = query(
    collection(db, STUDIOS_COLLECTION),
    ...constraints
  );

  return onSnapshot(studiosQuery, (snapshot) => {
    const studios: Profile[] = snapshot.docs.map(
      (docSnap) =>
        ({
          ...docSnap.data(),
          id: docSnap.id,
        } as Profile)
    );

    callback(studios);
  });
}

/**
 * Search studios by name or location
 */
export async function searchStudios(
  searchTerm: string,
  limitCount: number = 20
): Promise<Profile[]> {
  try {
    const { studios } = await getStudios({ limitCount: 100 });

    const searchLower = searchTerm.toLowerCase();
    return studios
      .filter(
        (studio) =>
          studio.name?.toLowerCase().includes(searchLower) ||
          studio.location?.toLowerCase().includes(searchLower) ||
          studio.styles?.some((style) =>
            style.toLowerCase().includes(searchLower)
          )
      )
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error searching studios:", error);
    throw new Error("Failed to search studios");
  }
}

/**
 * Increment view count for a studio profile
 */
export async function incrementStudioView(studioId: string): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    await updateDoc(studioRef, {
      view_count: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    // Don't throw - this is not critical
  }
}

/**
 * Update studio profile
 */
export async function updateStudioProfile(
  studioId: string,
  updates: Partial<Profile>
): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    await updateDoc(studioRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating studio profile:", error);
    throw new Error("Failed to update profile");
  }
}

/**
 * Get studio dashboard data
 */
export async function getStudioDashboardData(studioId: string): Promise<{
  studio: Profile | null;
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  pendingApplications: number;
  benchSize: number;
}> {
  try {
    const studio = await getStudioById(studioId);

    // Get job stats
    const { getJobStats } = await import("./jobService");
    const jobStats = await getJobStats(studioId);

    // Get bench (saved profiles)
    const { getSavedProfiles } = await import("./talentService");
    const bench = await getSavedProfiles(studioId);

    return {
      studio,
      totalJobs: jobStats.totalJobs,
      openJobs: jobStats.openJobs,
      totalApplications: jobStats.totalApplications,
      pendingApplications: jobStats.pendingApplications,
      benchSize: bench.length,
    };
  } catch (error) {
    console.error("Error fetching studio dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

/**
 * Get studio dashboard stats (for stats cards)
 */
export async function getStudioDashboardStats(studioId: string): Promise<{
  openJobs: number;
  pendingApplications: number;
  benchSize: number;
  newJobsToday: number;
}> {
  try {
    const { getJobStats, getStudioJobs } = await import("./jobService");
    const jobStats = await getJobStats(studioId);

    // Get jobs created today
    const { jobs } = await getStudioJobs(studioId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newJobsToday = jobs.filter((job) => {
      const jobDate = new Date(job.created_at);
      return jobDate >= today;
    }).length;

    // Get bench (saved profiles)
    const { getSavedProfiles } = await import("./talentService");
    const bench = await getSavedProfiles(studioId);

    return {
      openJobs: jobStats.openJobs,
      pendingApplications: jobStats.pendingApplications,
      benchSize: bench.length,
      newJobsToday,
    };
  } catch (error) {
    console.error("Error fetching studio dashboard stats:", error);
    return {
      openJobs: 0,
      pendingApplications: 0,
      benchSize: 0,
      newJobsToday: 0,
    };
  }
}

/**
 * Get featured studios (for homepage)
 */
export async function getFeaturedStudios(
  count: number = 6
): Promise<Profile[]> {
  try {
    const { studios } = await getStudios({
      sortBy: "rating",
      limitCount: count,
    });

    return studios;
  } catch (error) {
    console.error("Error fetching featured studios:", error);
    return [];
  }
}

/**
 * Add instructor to studio's roster
 */
export async function addInstructorToRoster(
  studioId: string,
  instructorId: string
): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const studioSnap = await getDoc(studioRef);

    if (!studioSnap.exists()) {
      throw new Error("Studio not found");
    }

    const studioData = studioSnap.data() as Profile;
    const currentInstructors = studioData.instructors || [];

    if (!currentInstructors.includes(instructorId)) {
      await updateDoc(studioRef, {
        instructors: [...currentInstructors, instructorId],
        updated_at: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error adding instructor to roster:", error);
    throw new Error("Failed to add instructor");
  }
}

/**
 * Remove instructor from studio's roster
 */
export async function removeInstructorFromRoster(
  studioId: string,
  instructorId: string
): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const studioSnap = await getDoc(studioRef);

    if (!studioSnap.exists()) {
      throw new Error("Studio not found");
    }

    const studioData = studioSnap.data() as Profile;
    const currentInstructors = studioData.instructors || [];

    await updateDoc(studioRef, {
      instructors: currentInstructors.filter((id) => id !== instructorId),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error removing instructor from roster:", error);
    throw new Error("Failed to remove instructor");
  }
}

/**
 * Get studio's instructor roster
 */
export async function getStudioRoster(studioId: string): Promise<Profile[]> {
  try {
    const studio = await getStudioById(studioId);
    if (!studio || !studio.instructors || studio.instructors.length === 0) {
      return [];
    }

    const { getInstructorById } = await import("./talentService");
    const instructors = await Promise.all(
      studio.instructors.map((id) => getInstructorById(id))
    );

    return instructors.filter((inst): inst is Profile => inst !== null);
  } catch (error) {
    console.error("Error fetching studio roster:", error);
    throw new Error("Failed to fetch roster");
  }
}

// =============== STUDIO CLAIMING ===============

/**
 * Generate a unique claim token for a studio
 */
function generateClaimToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create a claim token for a studio (admin function)
 */
export async function createStudioClaimToken(
  studioId: string,
  expiresInDays: number = 30
): Promise<StudioClaimToken> {
  try {
    const token = generateClaimToken();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + expiresInDays * 24 * 60 * 60 * 1000
    );

    const claimTokenRef = doc(collection(db, STUDIO_CLAIM_TOKENS_COLLECTION));
    const claimToken: StudioClaimToken = {
      id: claimTokenRef.id,
      studio_id: studioId,
      token,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      claimed: false,
    };

    await setDoc(claimTokenRef, claimToken);

    return claimToken;
  } catch (error) {
    console.error("Error creating studio claim token:", error);
    throw new Error("Failed to create claim token");
  }
}

/**
 * Get claim token by token string
 */
export async function getClaimToken(
  token: string
): Promise<StudioClaimToken | null> {
  try {
    const tokenQuery = query(
      collection(db, STUDIO_CLAIM_TOKENS_COLLECTION),
      where("token", "==", token)
    );
    const snapshot = await getDocs(tokenQuery);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as StudioClaimToken;
  } catch (error) {
    console.error("Error getting claim token:", error);
    throw new Error("Failed to get claim token");
  }
}

/**
 * Claim a studio using a claim token
 */
export async function claimStudio(
  token: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; studioId?: string; error?: string }> {
  try {
    // Get the claim token
    const claimToken = await getClaimToken(token);

    if (!claimToken) {
      return { success: false, error: "Invalid claim token" };
    }

    if (claimToken.claimed) {
      return { success: false, error: "This studio has already been claimed" };
    }

    const now = new Date();
    if (new Date(claimToken.expires_at) < now) {
      return { success: false, error: "This claim token has expired" };
    }

    // Get the studio
    const studio = await getStudioById(claimToken.studio_id);
    if (!studio) {
      return { success: false, error: "Studio not found" };
    }

    // Update the user's profile to link to this studio
    const profileRef = doc(db, PROFILES_COLLECTION, userId);
    await setDoc(
      profileRef,
      {
        id: userId,
        email: userEmail,
        user_type: "studio",
        name: studio.name,
        description: studio.description,
        location: studio.location,
        images: studio.images,
        styles: studio.styles,
        amenities: studio.amenities,
        hiring_types: studio.hiring_types,
        website: studio.website,
        instagram: studio.instagram,
        contact_email: studio.email,
        contact_phone: studio.phone_number,
        profile_completed: studio.profile_completed,
        claimed_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Also update the studios collection
    const studioRef = doc(db, STUDIOS_COLLECTION, claimToken.studio_id);
    await updateDoc(studioRef, {
      claimed_by: userId,
      claimed_at: serverTimestamp(),
    });

    // Mark the token as claimed
    const tokenQuery = query(
      collection(db, STUDIO_CLAIM_TOKENS_COLLECTION),
      where("token", "==", token)
    );
    const tokenSnapshot = await getDocs(tokenQuery);
    if (!tokenSnapshot.empty) {
      const tokenDocRef = doc(
        db,
        STUDIO_CLAIM_TOKENS_COLLECTION,
        tokenSnapshot.docs[0].id
      );
      await updateDoc(tokenDocRef, {
        claimed: true,
        claimed_by: userId,
        claimed_at: serverTimestamp(),
      });
    }

    return { success: true, studioId: claimToken.studio_id };
  } catch (error) {
    console.error("Error claiming studio:", error);
    return { success: false, error: "Failed to claim studio" };
  }
}

/**
 * Create a new studio profile (for new user registration)
 */
export async function createStudioProfile(
  userId: string,
  email: string,
  initialData?: Partial<Profile>
): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, userId);
    const profileRef = doc(db, PROFILES_COLLECTION, userId);

    const studioData: Partial<Profile> = {
      id: userId,
      email,
      user_type: "studio",
      profile_completed: false,
      subscription_tier: "free",
      subscription_status: "active",
      ...initialData,
    };

    // Create both in studios and profiles collections
    await setDoc(studioRef, {
      ...studioData,
      created_at: serverTimestamp(),
    });

    await setDoc(profileRef, {
      ...studioData,
      created_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating studio profile:", error);
    throw new Error("Failed to create studio profile");
  }
}

/**
 * Get full studio details including related data
 */
export async function getStudioDetails(
  studioId: string
): Promise<StudioDetails | null> {
  try {
    const studio = await getStudioById(studioId);
    if (!studio) {
      return null;
    }

    // Get open jobs
    const { getStudioJobs } = await import("./jobService");
    const { jobs: openPositions } = await getStudioJobs(studioId);

    // Get guest spots
    const { getStudioGuestSpots } = await import("./guestSpotService");
    const { guestSpots } = await getStudioGuestSpots(studioId);

    // Get instructors
    const instructors = await getStudioRoster(studioId);

    // Get reviews (if we have a review service)
    const reviews: unknown[] = [];
    try {
      // TODO: Add review service integration
    } catch {
      // Ignore review errors
    }

    return {
      ...studio,
      openPositions: openPositions.filter((j) => j.status === "open"),
      guestSpots: guestSpots.filter((gs) => gs.status === "open"),
      instructors,
      reviews,
    } as StudioDetails;
  } catch (error) {
    console.error("Error fetching studio details:", error);
    throw new Error("Failed to fetch studio details");
  }
}

/**
 * Delete a studio profile
 */
export async function deleteStudioProfile(studioId: string): Promise<void> {
  try {
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    await deleteDoc(studioRef);

    // Also delete from profiles
    const profileRef = doc(db, PROFILES_COLLECTION, studioId);
    await deleteDoc(profileRef);
  } catch (error) {
    console.error("Error deleting studio profile:", error);
    throw new Error("Failed to delete studio profile");
  }
}

/**
 * Generate claim link for a studio
 */
export async function generateStudioClaimLink(
  studioId: string,
  baseUrl: string = "https://fitgig.com"
): Promise<string> {
  try {
    const claimToken = await createStudioClaimToken(studioId);
    return `${baseUrl}/claim-studio?token=${claimToken.token}`;
  } catch (error) {
    console.error("Error generating claim link:", error);
    throw new Error("Failed to generate claim link");
  }
}
