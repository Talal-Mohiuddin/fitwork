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
} from "firebase/firestore";
import { db } from "@/firebase";
import {
  GuestSpot,
  GuestSpotWithStudio,
  GuestSpotApplication,
  GuestSpotApplicationStatus,
  GuestSpotApplicationWithDetails,
  Profile,
} from "@/types";

// Collections
const GUEST_SPOTS_COLLECTION = "guest_spots";
const GUEST_SPOT_APPLICATIONS_COLLECTION = "guest_spot_applications";
const STUDIOS_COLLECTION = "studios";
const PROFILES_COLLECTION = "profiles";

// =============== GUEST SPOTS CRUD ===============

/**
 * Create a new guest spot
 */
export async function createGuestSpot(
  studioId: string,
  guestSpotData: Omit<GuestSpot, "id" | "created_at" | "status">
): Promise<string> {
  try {
    const guestSpotRef = doc(collection(db, GUEST_SPOTS_COLLECTION));
    const guestSpot: Omit<GuestSpot, "id"> & { id: string } = {
      ...guestSpotData,
      id: guestSpotRef.id,
      studio_id: studioId,
      status: "open",
      created_at: new Date().toISOString(),
    };

    await setDoc(guestSpotRef, {
      ...guestSpot,
      created_at: serverTimestamp(),
    });

    return guestSpotRef.id;
  } catch (error) {
    console.error("Error creating guest spot:", error);
    throw new Error("Failed to create guest spot");
  }
}

/**
 * Get a single guest spot by ID with studio details
 */
export async function getGuestSpotById(
  guestSpotId: string
): Promise<GuestSpotWithStudio | null> {
  try {
    const guestSpotRef = doc(db, GUEST_SPOTS_COLLECTION, guestSpotId);
    const guestSpotSnap = await getDoc(guestSpotRef);

    if (!guestSpotSnap.exists()) {
      return null;
    }

    const guestSpotData = guestSpotSnap.data() as GuestSpot;

    // Get studio details
    const studioRef = doc(db, STUDIOS_COLLECTION, guestSpotData.studio_id);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists()
      ? (studioSnap.data() as Profile)
      : null;

    // Get application count
    const appQuery = query(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
      where("guest_spot_id", "==", guestSpotId)
    );
    const appSnapshot = await getDocs(appQuery);

    return {
      ...guestSpotData,
      id: guestSpotSnap.id,
      studio: {
        id: guestSpotData.studio_id,
        name: studioData?.name || null,
        location: studioData?.location || null,
        images: studioData?.images || null,
      },
      application_count: appSnapshot.size,
    };
  } catch (error) {
    console.error("Error fetching guest spot:", error);
    throw new Error("Failed to fetch guest spot");
  }
}

/**
 * Get all guest spots with optional filters
 */
export async function getGuestSpots(filters?: {
  status?: "open" | "filled" | "cancelled";
  studioId?: string;
  styles?: string[];
  location?: string;
  durationType?: string;
  accommodationsProvided?: boolean;
  travelCovered?: boolean;
  sortBy?: "latest" | "oldest" | "start_date";
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{ guestSpots: GuestSpotWithStudio[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [];

    // Status filter (default to open)
    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    } else {
      constraints.push(where("status", "==", "open"));
    }

    // Studio filter
    if (filters?.studioId) {
      constraints.push(where("studio_id", "==", filters.studioId));
    }

    // Sort
    if (filters?.sortBy === "oldest") {
      constraints.push(orderBy("created_at", "asc"));
    } else if (filters?.sortBy === "start_date") {
      constraints.push(orderBy("start_date", "asc"));
    } else {
      constraints.push(orderBy("created_at", "desc"));
    }

    // Pagination
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    if (filters?.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    const guestSpotsQuery = query(
      collection(db, GUEST_SPOTS_COLLECTION),
      ...constraints
    );
    const guestSpotsSnapshot = await getDocs(guestSpotsQuery);

    // Get unique studio IDs
    const studioIds = [
      ...new Set(guestSpotsSnapshot.docs.map((doc) => doc.data().studio_id)),
    ];

    // Fetch all studios in parallel
    const studioPromises = studioIds.map(async (id) => {
      const studioRef = doc(db, STUDIOS_COLLECTION, id);
      const studioSnap = await getDoc(studioRef);
      return {
        id,
        data: studioSnap.exists() ? (studioSnap.data() as Profile) : null,
      };
    });

    const studios = await Promise.all(studioPromises);
    const studioMap = new Map(studios.map((s) => [s.id, s.data]));

    // Get application counts for all guest spots
    const guestSpotIds = guestSpotsSnapshot.docs.map((d) => d.id);
    const appCountMap = new Map<string, number>();

    for (const gsId of guestSpotIds) {
      const appQuery = query(
        collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
        where("guest_spot_id", "==", gsId)
      );
      const appSnap = await getDocs(appQuery);
      appCountMap.set(gsId, appSnap.size);
    }

    // Map guest spots with studio data
    let guestSpots: GuestSpotWithStudio[] = guestSpotsSnapshot.docs.map(
      (docSnap) => {
        const guestSpotData = docSnap.data() as GuestSpot;
        const studioData = studioMap.get(guestSpotData.studio_id);

        return {
          ...guestSpotData,
          id: docSnap.id,
          studio: {
            id: guestSpotData.studio_id,
            name: studioData?.name || null,
            location: studioData?.location || null,
            images: studioData?.images || null,
          },
          application_count: appCountMap.get(docSnap.id) || 0,
        };
      }
    );

    // Client-side filtering for complex queries
    if (filters?.styles && filters.styles.length > 0) {
      guestSpots = guestSpots.filter((gs) =>
        gs.styles.some((style) => filters.styles!.includes(style))
      );
    }

    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      guestSpots = guestSpots.filter(
        (gs) =>
          gs.location?.toLowerCase().includes(locationLower) ||
          gs.studio.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters?.durationType) {
      guestSpots = guestSpots.filter(
        (gs) => gs.duration_type === filters.durationType
      );
    }

    if (filters?.accommodationsProvided !== undefined) {
      guestSpots = guestSpots.filter(
        (gs) => gs.accommodations_provided === filters.accommodationsProvided
      );
    }

    if (filters?.travelCovered !== undefined) {
      guestSpots = guestSpots.filter(
        (gs) => gs.travel_covered === filters.travelCovered
      );
    }

    const lastDoc =
      guestSpotsSnapshot.docs[guestSpotsSnapshot.docs.length - 1] || null;

    return { guestSpots, lastDoc };
  } catch (error) {
    console.error("Error fetching guest spots:", error);
    throw new Error("Failed to fetch guest spots");
  }
}

/**
 * Subscribe to real-time guest spot updates
 */
export function subscribeToGuestSpots(
  callback: (guestSpots: GuestSpotWithStudio[]) => void,
  filters?: { status?: "open" | "filled" | "cancelled"; studioId?: string }
): () => void {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) {
    constraints.push(where("status", "==", filters.status));
  } else {
    constraints.push(where("status", "==", "open"));
  }

  if (filters?.studioId) {
    constraints.push(where("studio_id", "==", filters.studioId));
  }

  constraints.push(orderBy("created_at", "desc"));

  const guestSpotsQuery = query(
    collection(db, GUEST_SPOTS_COLLECTION),
    ...constraints
  );

  return onSnapshot(guestSpotsQuery, async (snapshot) => {
    const studioIds = [
      ...new Set(snapshot.docs.map((doc) => doc.data().studio_id)),
    ];

    const studioPromises = studioIds.map(async (id) => {
      const studioRef = doc(db, STUDIOS_COLLECTION, id);
      const studioSnap = await getDoc(studioRef);
      return {
        id,
        data: studioSnap.exists() ? (studioSnap.data() as Profile) : null,
      };
    });

    const studios = await Promise.all(studioPromises);
    const studioMap = new Map(studios.map((s) => [s.id, s.data]));

    const guestSpots: GuestSpotWithStudio[] = snapshot.docs.map((docSnap) => {
      const guestSpotData = docSnap.data() as GuestSpot;
      const studioData = studioMap.get(guestSpotData.studio_id);

      return {
        ...guestSpotData,
        id: docSnap.id,
        studio: {
          id: guestSpotData.studio_id,
          name: studioData?.name || null,
          location: studioData?.location || null,
          images: studioData?.images || null,
        },
      };
    });

    callback(guestSpots);
  });
}

/**
 * Update a guest spot
 */
export async function updateGuestSpot(
  guestSpotId: string,
  updates: Partial<GuestSpot>
): Promise<void> {
  try {
    const guestSpotRef = doc(db, GUEST_SPOTS_COLLECTION, guestSpotId);
    await updateDoc(guestSpotRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating guest spot:", error);
    throw new Error("Failed to update guest spot");
  }
}

/**
 * Fill a guest spot (mark as filled)
 */
export async function fillGuestSpot(guestSpotId: string): Promise<void> {
  try {
    await updateGuestSpot(guestSpotId, { status: "filled" });
  } catch (error) {
    console.error("Error filling guest spot:", error);
    throw new Error("Failed to fill guest spot");
  }
}

/**
 * Cancel a guest spot
 */
export async function cancelGuestSpot(guestSpotId: string): Promise<void> {
  try {
    await updateGuestSpot(guestSpotId, { status: "cancelled" });
  } catch (error) {
    console.error("Error cancelling guest spot:", error);
    throw new Error("Failed to cancel guest spot");
  }
}

/**
 * Delete a guest spot
 */
export async function deleteGuestSpot(guestSpotId: string): Promise<void> {
  try {
    const guestSpotRef = doc(db, GUEST_SPOTS_COLLECTION, guestSpotId);
    await deleteDoc(guestSpotRef);
  } catch (error) {
    console.error("Error deleting guest spot:", error);
    throw new Error("Failed to delete guest spot");
  }
}

// =============== GUEST SPOT APPLICATIONS ===============

/**
 * Apply to a guest spot
 */
export async function applyToGuestSpot(
  guestSpotId: string,
  applicantId: string,
  message?: string,
  proposedRate?: string
): Promise<string> {
  try {
    // Check if already applied
    const existingApp = await getGuestSpotApplicationStatus(
      guestSpotId,
      applicantId
    );
    if (existingApp.hasApplied) {
      throw new Error("You have already applied to this guest spot");
    }

    const applicationRef = doc(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION)
    );
    const application: GuestSpotApplication = {
      id: applicationRef.id,
      guest_spot_id: guestSpotId,
      applicant_id: applicantId,
      applied_at: new Date().toISOString(),
      status: "pending",
      message,
      proposed_rate: proposedRate,
      type: "apply",
    };

    await setDoc(applicationRef, {
      ...application,
      applied_at: serverTimestamp(),
    });

    return applicationRef.id;
  } catch (error) {
    console.error("Error applying to guest spot:", error);
    throw error;
  }
}

/**
 * Invite an instructor to a guest spot
 */
export async function inviteToGuestSpot(
  guestSpotId: string,
  instructorId: string,
  message?: string
): Promise<string> {
  try {
    const applicationRef = doc(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION)
    );
    const application: GuestSpotApplication = {
      id: applicationRef.id,
      guest_spot_id: guestSpotId,
      applicant_id: instructorId,
      applied_at: new Date().toISOString(),
      status: "invited",
      message,
      type: "invite",
    };

    await setDoc(applicationRef, {
      ...application,
      applied_at: serverTimestamp(),
    });

    return applicationRef.id;
  } catch (error) {
    console.error("Error inviting instructor to guest spot:", error);
    throw new Error("Failed to send invitation");
  }
}

/**
 * Get application status for a specific guest spot and applicant
 */
export async function getGuestSpotApplicationStatus(
  guestSpotId: string,
  applicantId: string
): Promise<GuestSpotApplicationStatus> {
  try {
    const appQuery = query(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
      where("guest_spot_id", "==", guestSpotId),
      where("applicant_id", "==", applicantId)
    );

    const snapshot = await getDocs(appQuery);

    if (snapshot.empty) {
      return { hasApplied: false };
    }

    const application = snapshot.docs[0].data() as GuestSpotApplication;
    return {
      hasApplied: true,
      applicationId: snapshot.docs[0].id,
      status: application.status,
    };
  } catch (error) {
    console.error("Error checking guest spot application status:", error);
    return { hasApplied: false };
  }
}

/**
 * Get all applications for a guest spot
 */
export async function getGuestSpotApplications(
  guestSpotId: string
): Promise<GuestSpotApplication[]> {
  try {
    const appQuery = query(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
      where("guest_spot_id", "==", guestSpotId),
      orderBy("applied_at", "desc")
    );

    const snapshot = await getDocs(appQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        } as GuestSpotApplication)
    );
  } catch (error) {
    console.error("Error fetching guest spot applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

/**
 * Get all applications by an instructor (with guest spot details)
 */
export async function getInstructorGuestSpotApplications(
  applicantId: string
): Promise<GuestSpotApplicationWithDetails[]> {
  try {
    const appQuery = query(
      collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
      where("applicant_id", "==", applicantId),
      orderBy("applied_at", "desc")
    );

    const snapshot = await getDocs(appQuery);
    const applications = snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        } as GuestSpotApplication)
    );

    // Fetch guest spot details for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        try {
          const guestSpot = await getGuestSpotById(app.guest_spot_id);

          return {
            ...app,
            guest_spot: guestSpot!,
          } as GuestSpotApplicationWithDetails;
        } catch {
          return {
            ...app,
            guest_spot: null as unknown as GuestSpotWithStudio,
          } as GuestSpotApplicationWithDetails;
        }
      })
    );

    return applicationsWithDetails.filter((a) => a.guest_spot !== null);
  } catch (error) {
    console.error("Error fetching instructor guest spot applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

/**
 * Update application status (accept/reject)
 */
export async function updateGuestSpotApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
): Promise<void> {
  try {
    const appRef = doc(db, GUEST_SPOT_APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(appRef, {
      status,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating guest spot application status:", error);
    throw new Error("Failed to update application status");
  }
}

/**
 * Withdraw an application
 */
export async function withdrawGuestSpotApplication(
  applicationId: string
): Promise<void> {
  try {
    const appRef = doc(db, GUEST_SPOT_APPLICATIONS_COLLECTION, applicationId);
    await deleteDoc(appRef);
  } catch (error) {
    console.error("Error withdrawing guest spot application:", error);
    throw new Error("Failed to withdraw application");
  }
}

/**
 * Get guest spots posted by a studio
 */
export async function getStudioGuestSpots(
  studioId: string,
  includeApplications: boolean = false
): Promise<{ guestSpots: GuestSpotWithStudio[] }> {
  try {
    const guestSpotsQuery = query(
      collection(db, GUEST_SPOTS_COLLECTION),
      where("studio_id", "==", studioId),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(guestSpotsQuery);

    // Get studio info
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists()
      ? (studioSnap.data() as Profile)
      : null;

    const guestSpots: GuestSpotWithStudio[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const guestSpotData = docSnap.data() as GuestSpot;
        let applications: GuestSpotApplication[] = [];
        let application_count = 0;

        if (includeApplications) {
          applications = await getGuestSpotApplications(docSnap.id);
          application_count = applications.length;
        } else {
          // Just get the count
          const appQuery = query(
            collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
            where("guest_spot_id", "==", docSnap.id)
          );
          const appSnap = await getDocs(appQuery);
          application_count = appSnap.size;
        }

        return {
          ...guestSpotData,
          id: docSnap.id,
          studio: {
            id: studioId,
            name: studioData?.name || null,
            location: studioData?.location || null,
            images: studioData?.images || null,
          },
          applications: includeApplications ? applications : undefined,
          application_count,
        };
      })
    );

    return { guestSpots };
  } catch (error) {
    console.error("Error fetching studio guest spots:", error);
    throw new Error("Failed to fetch studio guest spots");
  }
}

/**
 * Get guest spot statistics for dashboard
 */
export async function getGuestSpotStats(studioId: string): Promise<{
  totalGuestSpots: number;
  openGuestSpots: number;
  filledGuestSpots: number;
  totalApplications: number;
  pendingApplications: number;
}> {
  try {
    // Get all studio guest spots
    const guestSpotsQuery = query(
      collection(db, GUEST_SPOTS_COLLECTION),
      where("studio_id", "==", studioId)
    );
    const guestSpotsSnapshot = await getDocs(guestSpotsQuery);

    const guestSpots = guestSpotsSnapshot.docs.map(
      (doc) => doc.data() as GuestSpot
    );
    const guestSpotIds = guestSpotsSnapshot.docs.map((doc) => doc.id);

    // Get all applications for these guest spots
    let totalApplications = 0;
    let pendingApplications = 0;

    for (const guestSpotId of guestSpotIds) {
      const applications = await getGuestSpotApplications(guestSpotId);
      totalApplications += applications.length;
      pendingApplications += applications.filter(
        (a) => a.status === "pending"
      ).length;
    }

    return {
      totalGuestSpots: guestSpots.length,
      openGuestSpots: guestSpots.filter((gs) => gs.status === "open").length,
      filledGuestSpots: guestSpots.filter((gs) => gs.status === "filled").length,
      totalApplications,
      pendingApplications,
    };
  } catch (error) {
    console.error("Error fetching guest spot stats:", error);
    throw new Error("Failed to fetch guest spot statistics");
  }
}

/**
 * Get all applications for a studio's guest spots (with applicant and guest spot details)
 */
export async function getStudioGuestSpotApplications(
  studioId: string
): Promise<
  (GuestSpotApplication & {
    applicant?: Profile;
    guest_spot?: { title: string; start_date?: string; location?: string };
  })[]
> {
  try {
    // Get all studio guest spots first
    const { guestSpots } = await getStudioGuestSpots(studioId);
    const guestSpotIds = guestSpots.map((gs) => gs.id);

    if (guestSpotIds.length === 0) return [];

    // Get all applications for these guest spots
    const allApplications: (GuestSpotApplication & {
      applicant?: Profile;
      guest_spot?: { title: string; start_date?: string; location?: string };
    })[] = [];

    for (const guestSpotId of guestSpotIds) {
      const appQuery = query(
        collection(db, GUEST_SPOT_APPLICATIONS_COLLECTION),
        where("guest_spot_id", "==", guestSpotId),
        orderBy("applied_at", "desc")
      );

      const snapshot = await getDocs(appQuery);
      const guestSpotData = guestSpots.find((gs) => gs.id === guestSpotId);

      for (const docSnap of snapshot.docs) {
        const appData = docSnap.data() as GuestSpotApplication;

        // Get applicant details
        let applicant: Profile | undefined;
        try {
          const profileRef = doc(db, PROFILES_COLLECTION, appData.applicant_id);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            applicant = { ...profileSnap.data(), id: profileSnap.id } as Profile;
          }
        } catch {
          // Ignore errors fetching applicant
        }

        allApplications.push({
          ...appData,
          id: docSnap.id,
          applicant,
          guest_spot: guestSpotData
            ? {
                title: guestSpotData.title,
                start_date: guestSpotData.start_date,
                location: guestSpotData.location,
              }
            : undefined,
        });
      }
    }

    // Sort by applied_at descending
    return allApplications.sort(
      (a, b) =>
        new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    );
  } catch (error) {
    console.error("Error fetching studio guest spot applications:", error);
    throw new Error("Failed to fetch applications");
  }
}
