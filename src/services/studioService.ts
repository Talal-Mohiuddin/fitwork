import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
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
import { Profile } from "@/types";
import { uploadBase64ToStorage } from "@/lib/uploadToStorage";

// Collections
const STUDIOS_COLLECTION = "studios";

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

    let studios: Profile[] = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    } as Profile));

    // Client-side filtering for complex queries
    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      studios = studios.filter(
        (studio) => studio.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters?.styles && filters.styles.length > 0) {
      studios = studios.filter((studio) =>
        studio.styles?.some((style) => filters.styles!.includes(style))
      );
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      studios = studios.filter((studio) =>
        studio.amenities?.some((amenity) => filters.amenities!.includes(amenity))
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
    const studios: Profile[] = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    } as Profile));

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
    const newJobsToday = jobs.filter(job => {
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
export async function getFeaturedStudios(count: number = 6): Promise<Profile[]> {
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
