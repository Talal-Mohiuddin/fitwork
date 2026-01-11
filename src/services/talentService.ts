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
import { Profile } from "@/types";

// Collections
const INSTRUCTORS_COLLECTION = "instructors";
const SAVED_PROFILES_COLLECTION = "saved_profiles";

export interface InstructorFilters {
  location?: string;
  styles?: string[];
  certifications?: string[];
  openToWork?: boolean;
  openToGuestSpots?: boolean;
  touringReady?: boolean;
  minRating?: number;
  minExperience?: number;
  sortBy?: "rating" | "experience" | "recent" | "views";
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}

/**
 * Get a single instructor profile by ID
 */
export async function getInstructorById(instructorId: string): Promise<Profile | null> {
  try {
    const instructorRef = doc(db, INSTRUCTORS_COLLECTION, instructorId);
    const instructorSnap = await getDoc(instructorRef);

    if (!instructorSnap.exists()) {
      return null;
    }

    return {
      ...instructorSnap.data(),
      id: instructorSnap.id,
    } as Profile;
  } catch (error) {
    console.error("Error fetching instructor:", error);
    throw new Error("Failed to fetch instructor");
  }
}

/**
 * Get all instructors with optional filters
 */
export async function getInstructors(
  filters?: InstructorFilters
): Promise<{ instructors: Profile[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [];

    // Only get completed profiles
    constraints.push(where("profile_completed", "==", true));

    // Open to work filter
    if (filters?.openToWork !== undefined) {
      constraints.push(where("open_to_work", "==", filters.openToWork));
    }

    // Open to guest spots filter
    if (filters?.openToGuestSpots !== undefined) {
      constraints.push(where("open_to_guest_spots", "==", filters.openToGuestSpots));
    }

    // Touring ready filter
    if (filters?.touringReady !== undefined) {
      constraints.push(where("touring_ready", "==", filters.touringReady));
    }

    // Sort options
    switch (filters?.sortBy) {
      case "rating":
        constraints.push(orderBy("rating", "desc"));
        break;
      case "experience":
        constraints.push(orderBy("years_of_experience", "desc"));
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

    const instructorsQuery = query(
      collection(db, INSTRUCTORS_COLLECTION),
      ...constraints
    );
    const snapshot = await getDocs(instructorsQuery);

    let instructors: Profile[] = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    } as Profile));

    // Client-side filtering for complex queries
    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      instructors = instructors.filter(
        (inst) => inst.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters?.styles && filters.styles.length > 0) {
      instructors = instructors.filter((inst) =>
        inst.fitness_styles?.some((style) => filters.styles!.includes(style))
      );
    }

    if (filters?.certifications && filters.certifications.length > 0) {
      instructors = instructors.filter((inst) =>
        inst.certifications?.some((cert) => filters.certifications!.includes(cert))
      );
    }

    if (filters?.minRating) {
      instructors = instructors.filter(
        (inst) => (inst.rating || 0) >= filters.minRating!
      );
    }

    if (filters?.minExperience) {
      instructors = instructors.filter(
        (inst) => (inst.years_of_experience || 0) >= filters.minExperience!
      );
    }

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { instructors, lastDoc };
  } catch (error) {
    console.error("Error fetching instructors:", error);
    throw new Error("Failed to fetch instructors");
  }
}

/**
 * Subscribe to real-time instructor updates
 */
export function subscribeToInstructors(
  callback: (instructors: Profile[]) => void,
  filters?: { openToWork?: boolean; limitCount?: number }
): () => void {
  const constraints: QueryConstraint[] = [];

  constraints.push(where("profile_completed", "==", true));

  if (filters?.openToWork !== undefined) {
    constraints.push(where("open_to_work", "==", filters.openToWork));
  }

  constraints.push(orderBy("created_at", "desc"));

  if (filters?.limitCount) {
    constraints.push(limit(filters.limitCount));
  }

  const instructorsQuery = query(
    collection(db, INSTRUCTORS_COLLECTION),
    ...constraints
  );

  return onSnapshot(instructorsQuery, (snapshot) => {
    const instructors: Profile[] = snapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    } as Profile));

    callback(instructors);
  });
}

/**
 * Search instructors by name or headline
 */
export async function searchInstructors(
  searchTerm: string,
  limitCount: number = 20
): Promise<Profile[]> {
  try {
    // Get all instructors and filter client-side (Firestore doesn't support full-text search)
    const { instructors } = await getInstructors({ limitCount: 100 });

    const searchLower = searchTerm.toLowerCase();
    return instructors
      .filter(
        (inst) =>
          inst.full_name?.toLowerCase().includes(searchLower) ||
          inst.headline?.toLowerCase().includes(searchLower) ||
          inst.fitness_styles?.some((style) =>
            style.toLowerCase().includes(searchLower)
          )
      )
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error searching instructors:", error);
    throw new Error("Failed to search instructors");
  }
}

/**
 * Increment view count for an instructor profile
 */
export async function incrementProfileView(instructorId: string): Promise<void> {
  try {
    const instructorRef = doc(db, INSTRUCTORS_COLLECTION, instructorId);
    await updateDoc(instructorRef, {
      view_count: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    // Don't throw - this is not critical
  }
}

/**
 * Update instructor profile
 */
export async function updateInstructorProfile(
  instructorId: string,
  updates: Partial<Profile>
): Promise<void> {
  try {
    const instructorRef = doc(db, INSTRUCTORS_COLLECTION, instructorId);
    await updateDoc(instructorRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating instructor profile:", error);
    throw new Error("Failed to update profile");
  }
}

// =============== SAVED PROFILES ===============

/**
 * Save an instructor profile (for studios)
 */
export async function saveProfile(
  userId: string,
  profileId: string
): Promise<void> {
  try {
    const savedRef = doc(
      db,
      SAVED_PROFILES_COLLECTION,
      `${userId}_${profileId}`
    );
    await setDoc(savedRef, {
      user_id: userId,
      profile_id: profileId,
      saved_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    throw new Error("Failed to save profile");
  }
}

/**
 * Unsave an instructor profile
 */
export async function unsaveProfile(
  userId: string,
  profileId: string
): Promise<void> {
  try {
    const savedRef = doc(
      db,
      SAVED_PROFILES_COLLECTION,
      `${userId}_${profileId}`
    );
    await deleteDoc(savedRef);
  } catch (error) {
    console.error("Error unsaving profile:", error);
    throw new Error("Failed to unsave profile");
  }
}

/**
 * Check if profile is saved
 */
export async function isProfileSaved(
  userId: string,
  profileId: string
): Promise<boolean> {
  try {
    const savedRef = doc(
      db,
      SAVED_PROFILES_COLLECTION,
      `${userId}_${profileId}`
    );
    const snapshot = await getDoc(savedRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking saved profile:", error);
    return false;
  }
}

/**
 * Get saved profiles for a user (studio's bench)
 */
export async function getSavedProfiles(userId: string): Promise<Profile[]> {
  try {
    const savedQuery = query(
      collection(db, SAVED_PROFILES_COLLECTION),
      where("user_id", "==", userId)
    );

    const savedSnapshot = await getDocs(savedQuery);
    const profileIds = savedSnapshot.docs.map((doc) => doc.data().profile_id);

    if (profileIds.length === 0) return [];

    const profiles = await Promise.all(
      profileIds.map((id) => getInstructorById(id))
    );

    return profiles.filter((profile): profile is Profile => profile !== null);
  } catch (error) {
    console.error("Error fetching saved profiles:", error);
    throw new Error("Failed to fetch saved profiles");
  }
}

/**
 * Get instructor statistics for dashboard
 */
export async function getInstructorStats(instructorId: string): Promise<{
  profileViews: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  classesScheduled: number;
}> {
  try {
    const instructor = await getInstructorById(instructorId);

    // Get applications
    const { getInstructorApplications } = await import("./jobService");
    const applications = await getInstructorApplications(instructorId);

    return {
      profileViews: instructor?.view_count || 0,
      totalApplications: applications.length,
      pendingApplications: applications.filter((a) => a.status === "pending").length,
      acceptedApplications: applications.filter((a) => a.status === "accepted").length,
      classesScheduled: 0, // Would come from a schedule service
    };
  } catch (error) {
    console.error("Error fetching instructor stats:", error);
    throw new Error("Failed to fetch statistics");
  }
}

/**
 * Get recommended instructors for a studio based on their job requirements
 */
export async function getRecommendedInstructors(
  studioId: string,
  requiredStyles: string[],
  location: string
): Promise<Profile[]> {
  try {
    const { instructors } = await getInstructors({
      openToWork: true,
      limitCount: 50,
    });

    // Score and sort by relevance
    const scoredInstructors = instructors.map((inst) => {
      let score = 0;

      // Style match
      const styleMatches = inst.fitness_styles?.filter((style) =>
        requiredStyles.includes(style)
      ).length || 0;
      score += styleMatches * 10;

      // Location match
      if (inst.location?.toLowerCase().includes(location.toLowerCase())) {
        score += 20;
      }

      // Rating bonus
      score += (inst.rating || 0) * 2;

      // Experience bonus
      score += (inst.years_of_experience || 0);

      return { ...inst, score };
    });

    return scoredInstructors
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...inst }) => inst);
  } catch (error) {
    console.error("Error getting recommended instructors:", error);
    throw new Error("Failed to get recommendations");
  }
}

/**
 * Get featured instructors (for homepage)
 */
export async function getFeaturedInstructors(count: number = 6): Promise<Profile[]> {
  try {
    const { instructors } = await getInstructors({
      openToWork: true,
      sortBy: "rating",
      limitCount: count,
    });

    return instructors;
  } catch (error) {
    console.error("Error fetching featured instructors:", error);
    return [];
  }
}
