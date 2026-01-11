import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Profile } from "@/types";

export interface InstructorWithStatus extends Profile {
  status: "draft" | "submitted" | "verified" | "rejected";
  submittedAt?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/**
 * Get all instructors pending verification
 */
export async function getPendingInstructors(): Promise<InstructorWithStatus[]> {
  try {
    const q = query(
      collection(db, "instructors"),
      where("status", "==", "submitted"),
      orderBy("submittedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as InstructorWithStatus[];
  } catch (error) {
    console.error("Error fetching pending instructors:", error);
    throw new Error("Failed to fetch pending instructors");
  }
}

/**
 * Get all verified instructors
 */
export async function getVerifiedInstructors(): Promise<InstructorWithStatus[]> {
  try {
    const q = query(
      collection(db, "instructors"),
      where("status", "==", "verified"),
      orderBy("verifiedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as InstructorWithStatus[];
  } catch (error) {
    console.error("Error fetching verified instructors:", error);
    throw new Error("Failed to fetch verified instructors");
  }
}

/**
 * Get all instructors (for admin view)
 */
export async function getAllInstructors(): Promise<InstructorWithStatus[]> {
  try {
    const q = query(
      collection(db, "instructors"),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as InstructorWithStatus[];
  } catch (error) {
    console.error("Error fetching all instructors:", error);
    throw new Error("Failed to fetch instructors");
  }
}

/**
 * Verify an instructor profile
 */
export async function verifyInstructor(instructorId: string): Promise<void> {
  try {
    const instructorRef = doc(db, "instructors", instructorId);
    await updateDoc(instructorRef, {
      status: "verified",
      verifiedAt: new Date().toISOString(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error verifying instructor:", error);
    throw new Error("Failed to verify instructor");
  }
}

/**
 * Reject an instructor profile
 */
export async function rejectInstructor(
  instructorId: string,
  reason: string
): Promise<void> {
  try {
    const instructorRef = doc(db, "instructors", instructorId);
    await updateDoc(instructorRef, {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error rejecting instructor:", error);
    throw new Error("Failed to reject instructor");
  }
}

/**
 * Get instructor stats for admin dashboard
 */
export async function getInstructorStats(): Promise<{
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  draft: number;
}> {
  try {
    const instructorsRef = collection(db, "instructors");
    const snapshot = await getDocs(instructorsRef);
    
    const stats = {
      total: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
      draft: 0,
    };

    snapshot.docs.forEach((doc) => {
      stats.total++;
      const status = doc.data().status;
      switch (status) {
        case "submitted":
          stats.pending++;
          break;
        case "verified":
          stats.verified++;
          break;
        case "rejected":
          stats.rejected++;
          break;
        case "draft":
          stats.draft++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Failed to fetch instructor stats");
  }
}

/**
 * Get job stats for admin dashboard
 */
export async function getJobStats(): Promise<{
  total: number;
  open: number;
  closed: number;
  applications: number;
}> {
  try {
    const jobsRef = collection(db, "jobs");
    const jobsSnapshot = await getDocs(jobsRef);
    
    const applicationsRef = collection(db, "job_applications");
    const applicationsSnapshot = await getDocs(applicationsRef);
    
    const stats = {
      total: jobsSnapshot.size,
      open: 0,
      closed: 0,
      applications: applicationsSnapshot.size,
    };

    jobsSnapshot.docs.forEach((doc) => {
      const status = doc.data().status;
      if (status === "open") {
        stats.open++;
      } else {
        stats.closed++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error fetching job stats:", error);
    throw new Error("Failed to fetch job stats");
  }
}
