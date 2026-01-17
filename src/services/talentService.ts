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
import { Profile, BenchInstructor } from "@/types";

// Collections
const INSTRUCTORS_COLLECTION = "instructors";
const SAVED_PROFILES_COLLECTION = "saved_profiles";
const BENCH_COLLECTION = "studio_bench";

export interface InstructorFilters {
  location?: string;
  styles?: string[];
  certifications?: string[];
  openToWork?: boolean;
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

// =============== STUDIO BENCH (SAVED INSTRUCTORS WITH DETAILS) ===============

/**
 * Add instructor to studio's bench
 */
export async function addToBench(
  studioId: string,
  instructorId: string,
  notes?: string,
  tags?: string[]
): Promise<void> {
  try {
    const benchRef = doc(db, BENCH_COLLECTION, `${studioId}_${instructorId}`);
    const benchItem: BenchInstructor = {
      id: `${studioId}_${instructorId}`,
      studioId,
      instructorId,
      addedAt: new Date().toISOString(),
      notes,
      tags,
    };
    
    await setDoc(benchRef, {
      ...benchItem,
      addedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding to bench:", error);
    throw new Error("Failed to add instructor to bench");
  }
}

/**
 * Remove instructor from studio's bench
 */
export async function removeFromBench(
  studioId: string,
  instructorId: string
): Promise<void> {
  try {
    const benchRef = doc(db, BENCH_COLLECTION, `${studioId}_${instructorId}`);
    await deleteDoc(benchRef);
  } catch (error) {
    console.error("Error removing from bench:", error);
    throw new Error("Failed to remove instructor from bench");
  }
}

/**
 * Check if instructor is on bench
 */
export async function isOnBench(
  studioId: string,
  instructorId: string
): Promise<boolean> {
  try {
    const benchRef = doc(db, BENCH_COLLECTION, `${studioId}_${instructorId}`);
    const snapshot = await getDoc(benchRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking bench:", error);
    return false;
  }
}

/**
 * Get studio's bench (saved instructors with details)
 */
export async function getStudioBench(studioId: string): Promise<BenchInstructor[]> {
  try {
    const benchQuery = query(
      collection(db, BENCH_COLLECTION),
      where("studioId", "==", studioId),
      orderBy("addedAt", "desc")
    );

    const snapshot = await getDocs(benchQuery);
    const benchItems = snapshot.docs.map(doc => doc.data() as BenchInstructor);

    // Fetch instructor details for each bench item
    const benchWithInstructors = await Promise.all(
      benchItems.map(async (item) => {
        const instructor = await getInstructorById(item.instructorId);
        return {
          ...item,
          instructor: instructor || undefined,
        };
      })
    );

    return benchWithInstructors;
  } catch (error) {
    console.error("Error fetching studio bench:", error);
    throw new Error("Failed to fetch bench");
  }
}

/**
 * Update bench item notes or tags
 */
export async function updateBenchItem(
  studioId: string,
  instructorId: string,
  updates: { notes?: string; tags?: string[]; lastContacted?: string }
): Promise<void> {
  try {
    const benchRef = doc(db, BENCH_COLLECTION, `${studioId}_${instructorId}`);
    await updateDoc(benchRef, updates);
  } catch (error) {
    console.error("Error updating bench item:", error);
    throw new Error("Failed to update bench item");
  }
}

/**
 * Mark last contacted time for a bench instructor
 */
export async function markBenchInstructorContacted(
  studioId: string,
  instructorId: string
): Promise<void> {
  try {
    const benchRef = doc(db, BENCH_COLLECTION, `${studioId}_${instructorId}`);
    await updateDoc(benchRef, {
      lastContacted: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error marking contacted:", error);
  }
}

/**
 * Get instructors with availability filter
 */
export async function getAvailableInstructors(
  date: string,
  styles: string[]
): Promise<Profile[]> {
  try {
    const { instructors } = await getInstructors({
      openToWork: true,
      styles,
      limitCount: 50,
    });

    // Filter by availability (would need more sophisticated availability checking)
    // For now, return all open-to-work instructors matching styles
    return instructors.filter(inst => inst.available !== false);
  } catch (error) {
    console.error("Error fetching available instructors:", error);
    return [];
  }
}
