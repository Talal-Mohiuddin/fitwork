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
  Job, 
  JobWithStudio, 
  JobApplication, 
  Profile, 
  ApplicationStatus,
  EnhancedJob,
  EnhancedJobWithStudio,
  JobPostingData,
  StudioDashboardStats
} from "@/types";

// Collections
const JOBS_COLLECTION = "jobs";
const APPLICATIONS_COLLECTION = "job_applications";
const STUDIOS_COLLECTION = "studios";
const SAVED_JOBS_COLLECTION = "saved_jobs";

/**
 * Create a new job posting
 */
export async function createJob(
  studioId: string,
  jobData: Omit<Job, "id" | "created_at" | "status">
): Promise<string> {
  try {
    const jobRef = doc(collection(db, JOBS_COLLECTION));
    const job: Omit<Job, "id"> & { id: string } = {
      ...jobData,
      id: jobRef.id,
      studio_id: studioId,
      status: "open",
      created_at: new Date().toISOString(),
    };

    await setDoc(jobRef, {
      ...job,
      created_at: serverTimestamp(),
    });

    return jobRef.id;
  } catch (error) {
    console.error("Error creating job:", error);
    throw new Error("Failed to create job posting");
  }
}

/**
 * Get a single job by ID with studio details
 */
export async function getJobById(jobId: string): Promise<JobWithStudio | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return null;
    }

    const jobData = jobSnap.data() as Job;
    
    // Get studio details
    const studioRef = doc(db, STUDIOS_COLLECTION, jobData.studio_id);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists() ? studioSnap.data() as Profile : null;

    return {
      ...jobData,
      id: jobSnap.id,
      studio: {
        name: studioData?.name || null,
        location: studioData?.location || null,
        images: studioData?.images || null,
      },
      applications: [],
    };
  } catch (error) {
    console.error("Error fetching job:", error);
    throw new Error("Failed to fetch job");
  }
}

/**
 * Get all jobs with optional filters
 */
export async function getJobs(filters?: {
  status?: "open" | "closed";
  studioId?: string;
  styles?: string[];
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  sortBy?: "latest" | "oldest" | "salary";
  limitCount?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{ jobs: JobWithStudio[]; lastDoc: DocumentSnapshot | null }> {
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

    const jobsQuery = query(collection(db, JOBS_COLLECTION), ...constraints);
    const jobsSnapshot = await getDocs(jobsQuery);

    // Get unique studio IDs
    const studioIds = [...new Set(jobsSnapshot.docs.map(doc => doc.data().studio_id))];
    
    // Fetch all studios in parallel
    const studioPromises = studioIds.map(async (id) => {
      const studioRef = doc(db, STUDIOS_COLLECTION, id);
      const studioSnap = await getDoc(studioRef);
      return { id, data: studioSnap.exists() ? studioSnap.data() as Profile : null };
    });
    
    const studios = await Promise.all(studioPromises);
    const studioMap = new Map(studios.map(s => [s.id, s.data]));

    // Map jobs with studio data
    let jobs: JobWithStudio[] = jobsSnapshot.docs.map((doc) => {
      const jobData = doc.data() as Job;
      const studioData = studioMap.get(jobData.studio_id);
      
      return {
        ...jobData,
        id: doc.id,
        studio: {
          name: studioData?.name || null,
          location: studioData?.location || null,
          images: studioData?.images || null,
        },
        applications: [],
      };
    });

    // Client-side filtering for complex queries
    if (filters?.styles && filters.styles.length > 0) {
      jobs = jobs.filter(job => 
        job.styles.some(style => filters.styles!.includes(style))
      );
    }

    if (filters?.location) {
      const locationLower = filters.location.toLowerCase();
      jobs = jobs.filter(job => 
        job.studio.location?.toLowerCase().includes(locationLower)
      );
    }

    const lastDoc = jobsSnapshot.docs[jobsSnapshot.docs.length - 1] || null;

    return { jobs, lastDoc };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}

/**
 * Subscribe to real-time job updates
 */
export function subscribeToJobs(
  callback: (jobs: JobWithStudio[]) => void,
  filters?: { status?: "open" | "closed"; studioId?: string }
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

  const jobsQuery = query(collection(db, JOBS_COLLECTION), ...constraints);

  return onSnapshot(jobsQuery, async (snapshot) => {
    const studioIds = [...new Set(snapshot.docs.map(doc => doc.data().studio_id))];
    
    const studioPromises = studioIds.map(async (id) => {
      const studioRef = doc(db, STUDIOS_COLLECTION, id);
      const studioSnap = await getDoc(studioRef);
      return { id, data: studioSnap.exists() ? studioSnap.data() as Profile : null };
    });
    
    const studios = await Promise.all(studioPromises);
    const studioMap = new Map(studios.map(s => [s.id, s.data]));

    const jobs: JobWithStudio[] = snapshot.docs.map((docSnap) => {
      const jobData = docSnap.data() as Job;
      const studioData = studioMap.get(jobData.studio_id);
      
      return {
        ...jobData,
        id: docSnap.id,
        studio: {
          name: studioData?.name || null,
          location: studioData?.location || null,
          images: studioData?.images || null,
        },
        applications: [],
      };
    });

    callback(jobs);
  });
}

/**
 * Update a job posting
 */
export async function updateJob(
  jobId: string,
  updates: Partial<Job>
): Promise<void> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating job:", error);
    throw new Error("Failed to update job");
  }
}

/**
 * Close a job posting
 */
export async function closeJob(jobId: string): Promise<void> {
  try {
    await updateJob(jobId, { status: "closed" });
  } catch (error) {
    console.error("Error closing job:", error);
    throw new Error("Failed to close job");
  }
}

/**
 * Delete a job posting
 */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error("Error deleting job:", error);
    throw new Error("Failed to delete job");
  }
}

// =============== JOB APPLICATIONS ===============

/**
 * Apply to a job
 */
export async function applyToJob(
  jobId: string,
  applicantId: string,
  message?: string
): Promise<string> {
  try {
    // Check if already applied
    const existingApp = await getApplicationStatus(jobId, applicantId);
    if (existingApp.hasApplied) {
      throw new Error("You have already applied to this job");
    }

    const applicationRef = doc(collection(db, APPLICATIONS_COLLECTION));
    const application: JobApplication = {
      id: applicationRef.id,
      job_id: jobId,
      applicant_id: applicantId,
      applied_at: new Date().toISOString(),
      status: "pending",
      message,
      type: "apply",
    };

    await setDoc(applicationRef, {
      ...application,
      applied_at: serverTimestamp(),
      ...(message !== undefined && { message }),
    });

    return applicationRef.id;
  } catch (error) {
    console.error("Error applying to job:", error);
    throw error;
  }
}

/**
 * Invite an instructor to apply for a job
 */
export async function inviteToJob(
  jobId: string,
  instructorId: string,
  message?: string
): Promise<string> {
  try {
    const applicationRef = doc(collection(db, APPLICATIONS_COLLECTION));
    const application: JobApplication = {
      id: applicationRef.id,
      job_id: jobId,
      applicant_id: instructorId,
      applied_at: new Date().toISOString(),
      status: "invited",
      message,
      type: "invite",
    };

    await setDoc(applicationRef, {
      ...application,
      applied_at: serverTimestamp(),
      ...(message !== undefined && { message }),
    });

    return applicationRef.id;
  } catch (error) {
    console.error("Error inviting instructor:", error);
    throw new Error("Failed to send invitation");
  }
}

/**
 * Get application status for a specific job and applicant
 */
export async function getApplicationStatus(
  jobId: string,
  applicantId: string
): Promise<ApplicationStatus> {
  try {
    const appQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("job_id", "==", jobId),
      where("applicant_id", "==", applicantId)
    );

    const snapshot = await getDocs(appQuery);

    if (snapshot.empty) {
      return { hasApplied: false };
    }

    const application = snapshot.docs[0].data() as JobApplication;
    return {
      hasApplied: true,
      applicationId: snapshot.docs[0].id,
      status: application.status,
    };
  } catch (error) {
    console.error("Error checking application status:", error);
    return { hasApplied: false };
  }
}

/**
 * Get all applications for a job
 */
export async function getJobApplications(
  jobId: string
): Promise<JobApplication[]> {
  try {
    const appQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("job_id", "==", jobId),
      orderBy("applied_at", "desc")
    );

    const snapshot = await getDocs(appQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as JobApplication));
  } catch (error) {
    console.error("Error fetching job applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

/**
 * Get all applications by an instructor (with job details)
 */
export async function getInstructorApplications(
  applicantId: string
): Promise<(JobApplication & { job?: { position: string; studio_name: string } })[]> {
  try {
    const appQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where("applicant_id", "==", applicantId),
      orderBy("applied_at", "desc")
    );

    const snapshot = await getDocs(appQuery);
    const applications = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as JobApplication));

    // Fetch job details for each application
    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        try {
          const jobRef = doc(db, JOBS_COLLECTION, app.job_id);
          const jobSnap = await getDoc(jobRef);
          
          if (jobSnap.exists()) {
            const jobData = jobSnap.data() as Job;
            
            // Get studio name
            const studioRef = doc(db, STUDIOS_COLLECTION, jobData.studio_id);
            const studioSnap = await getDoc(studioRef);
            const studioName = studioSnap.exists() ? studioSnap.data()?.name : 'Unknown Studio';
            
            return {
              ...app,
              job: {
                position: jobData.position,
                studio_name: studioName,
              },
            };
          }
          
          return app;
        } catch {
          return app;
        }
      })
    );

    return applicationsWithJobs;
  } catch (error) {
    console.error("Error fetching instructor applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

/**
 * Update application status (accept/reject)
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(appRef, {
      status,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error("Failed to update application status");
  }
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(applicationId: string): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await deleteDoc(appRef);
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw new Error("Failed to withdraw application");
  }
}

// =============== SAVED JOBS ===============

/**
 * Save a job
 */
export async function saveJob(userId: string, jobId: string): Promise<void> {
  try {
    const savedJobRef = doc(db, SAVED_JOBS_COLLECTION, `${userId}_${jobId}`);
    await setDoc(savedJobRef, {
      user_id: userId,
      job_id: jobId,
      saved_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving job:", error);
    throw new Error("Failed to save job");
  }
}

/**
 * Unsave a job
 */
export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  try {
    const savedJobRef = doc(db, SAVED_JOBS_COLLECTION, `${userId}_${jobId}`);
    await deleteDoc(savedJobRef);
  } catch (error) {
    console.error("Error unsaving job:", error);
    throw new Error("Failed to unsave job");
  }
}

/**
 * Check if job is saved
 */
export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
  try {
    const savedJobRef = doc(db, SAVED_JOBS_COLLECTION, `${userId}_${jobId}`);
    const snapshot = await getDoc(savedJobRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking saved job:", error);
    return false;
  }
}

/**
 * Get saved jobs for a user
 */
export async function getSavedJobs(userId: string): Promise<JobWithStudio[]> {
  try {
    const savedQuery = query(
      collection(db, SAVED_JOBS_COLLECTION),
      where("user_id", "==", userId)
    );

    const savedSnapshot = await getDocs(savedQuery);
    const jobIds = savedSnapshot.docs.map(doc => doc.data().job_id);

    if (jobIds.length === 0) return [];

    const jobs = await Promise.all(
      jobIds.map(id => getJobById(id))
    );

    return jobs.filter((job): job is JobWithStudio => job !== null);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    throw new Error("Failed to fetch saved jobs");
  }
}

/**
 * Get jobs posted by a studio
 */
export async function getStudioJobs(
  studioId: string,
  includeApplications: boolean = false
): Promise<{ jobs: JobWithStudio[] }> {
  try {
    const jobsQuery = query(
      collection(db, JOBS_COLLECTION),
      where("studio_id", "==", studioId),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(jobsQuery);

    // Get studio info
    const studioRef = doc(db, STUDIOS_COLLECTION, studioId);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists() ? studioSnap.data() as Profile : null;

    const jobs: JobWithStudio[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const jobData = docSnap.data() as Job;
        let applications: JobApplication[] = [];

        if (includeApplications) {
          applications = await getJobApplications(docSnap.id);
        }

        return {
          ...jobData,
          id: docSnap.id,
          studio: {
            name: studioData?.name || null,
            location: studioData?.location || null,
            images: studioData?.images || null,
          },
          applications: applications as any,
        };
      })
    );

    return { jobs };
  } catch (error) {
    console.error("Error fetching studio jobs:", error);
    throw new Error("Failed to fetch studio jobs");
  }
}

/**
 * Get job statistics for dashboard
 */
export async function getJobStats(studioId: string): Promise<{
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplications: number;
  pendingApplications: number;
}> {
  try {
    // Get all studio jobs
    const jobsQuery = query(
      collection(db, JOBS_COLLECTION),
      where("studio_id", "==", studioId)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    
    const jobs = jobsSnapshot.docs.map(doc => doc.data() as Job);
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);
    
    // Get all applications for these jobs
    let totalApplications = 0;
    let pendingApplications = 0;

    for (const jobId of jobIds) {
      const applications = await getJobApplications(jobId);
      totalApplications += applications.length;
      pendingApplications += applications.filter(a => a.status === "pending").length;
    }

    return {
      totalJobs: jobs.length,
      openJobs: jobs.filter(j => j.status === "open").length,
      closedJobs: jobs.filter(j => j.status === "closed").length,
      totalApplications,
      pendingApplications,
    };
  } catch (error) {
    console.error("Error fetching job stats:", error);
    throw new Error("Failed to fetch job statistics");
  }
}

/**
 * Get all applications for a studio's jobs (with applicant and job details)
 */
export async function getStudioApplications(
  studioId: string
): Promise<(JobApplication & { applicant?: Profile; job?: { position: string; start_date?: string } })[]> {
  try {
    // Get all studio jobs first
    const { jobs } = await getStudioJobs(studioId);
    const jobIds = jobs.map(j => j.id);
    
    if (jobIds.length === 0) return [];

    // Get all applications for these jobs
    const allApplications: (JobApplication & { applicant?: Profile; job?: { position: string; start_date?: string } })[] = [];
    
    for (const jobId of jobIds) {
      const appQuery = query(
        collection(db, APPLICATIONS_COLLECTION),
        where("job_id", "==", jobId),
        orderBy("applied_at", "desc")
      );
      
      const snapshot = await getDocs(appQuery);
      const jobData = jobs.find(j => j.id === jobId);
      
      for (const docSnap of snapshot.docs) {
        const appData = docSnap.data() as JobApplication;
        
        // Get applicant details
        let applicant: Profile | undefined;
        try {
          const { getInstructorById } = await import("./talentService");
          applicant = await getInstructorById(appData.applicant_id) || undefined;
        } catch {
          // Ignore errors fetching applicant
        }
        
        allApplications.push({
          ...appData,
          id: docSnap.id,
          applicant,
          job: jobData ? {
            position: jobData.position,
            start_date: jobData.start_date,
          } : undefined,
        });
      }
    }
    
    // Sort by applied_at descending
    return allApplications.sort((a, b) => 
      new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    );
  } catch (error) {
    console.error("Error fetching studio applications:", error);
    throw new Error("Failed to fetch applications");
  }
}

// =============== ENHANCED JOB POSTING ===============

/**
 * Create an enhanced job posting with all wizard data
 */
export async function createEnhancedJob(
  studioId: string,
  data: JobPostingData
): Promise<string> {
  try {
    const jobRef = doc(collection(db, JOBS_COLLECTION));
    
    // Build compensation string
    let compensation = '';
    if (data.payType === 'flat_fee') {
      compensation = `$${data.payAmount} flat`;
    } else if (data.payType === 'hourly') {
      compensation = `$${data.payAmount}/hr`;
    } else if (data.payType === 'range') {
      compensation = `$${data.payMin}-$${data.payMax}`;
    }

    const enhancedJob: EnhancedJob = {
      id: jobRef.id,
      studio_id: studioId,
      position: data.customClassType || data.classType,
      description: data.notes || `${data.classType} class at our studio`,
      classType: data.classType,
      customClassType: data.customClassType,
      
      // Schedule
      start_date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      isRecurring: data.isRecurring,
      recurringPattern: data.recurringPattern,
      
      // Location
      location: data.location,
      studioAddress: data.studioAddress,
      
      // Compensation
      compensation,
      payType: data.payType,
      payAmount: data.payAmount,
      payMin: data.payMin,
      payMax: data.payMax,
      currency: data.currency,
      
      // Employment
      employmentStatus: data.employmentStatus,
      cancellationPolicy: data.cancellationPolicy,
      
      // Requirements
      requirements: data.certificationsRequired,
      certificationsRequired: data.certificationsRequired,
      experienceLevel: data.experienceLevel,
      notes: data.notes,
      
      // Status
      status: "open",
      visibility: data.visibility,
      styles: [data.classType],
      created_at: new Date().toISOString(),
      applicantCount: 0,
    };

    await setDoc(jobRef, {
      ...enhancedJob,
      created_at: serverTimestamp(),
    });

    return jobRef.id;
  } catch (error) {
    console.error("Error creating enhanced job:", error);
    throw new Error("Failed to create job posting");
  }
}

/**
 * Get enhanced job by ID with full details
 */
export async function getEnhancedJobById(jobId: string): Promise<EnhancedJobWithStudio | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return null;
    }

    const jobData = jobSnap.data() as EnhancedJob;
    
    // Get studio details
    const studioRef = doc(db, STUDIOS_COLLECTION, jobData.studio_id);
    const studioSnap = await getDoc(studioRef);
    const studioData = studioSnap.exists() ? studioSnap.data() as Profile : null;

    // Get applications
    const applications = await getJobApplications(jobId);

    return {
      ...jobData,
      id: jobSnap.id,
      studio: {
        id: studioData?.id,
        name: studioData?.name || null,
        location: studioData?.location || null,
        images: studioData?.images || null,
        rating: studioData?.rating,
        description: studioData?.description,
      },
      applications,
      applicantCount: applications.length,
    };
  } catch (error) {
    console.error("Error fetching enhanced job:", error);
    throw new Error("Failed to fetch job");
  }
}

/**
 * Get dashboard stats for a studio
 */
export async function getStudioDashboardStats(studioId: string): Promise<StudioDashboardStats> {
  try {
    const stats = await getJobStats(studioId);
    
    // Calculate change (would need historical data for real implementation)
    // For now, returning mock change data
    return {
      openGigs: stats.openJobs,
      openGigsChange: 2, // Mock: +2 today
      newApplicants: stats.pendingApplications,
      activeClasses: stats.openJobs * 4, // Mock: assume 4 classes per job
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      openGigs: 0,
      openGigsChange: 0,
      newApplicants: 0,
      activeClasses: 0,
    };
  }
}

/**
 * Get jobs with match score for an instructor
 */
export async function getJobsWithMatchScore(
  instructorId: string,
  instructorProfile: Profile,
  filters?: {
    styles?: string[];
    location?: string;
    urgent?: boolean;
    maxDistance?: number;
  }
): Promise<EnhancedJobWithStudio[]> {
  try {
    const { jobs } = await getJobs({ status: "open", ...filters });
    
    // Calculate match score based on instructor profile
    const jobsWithScore = await Promise.all(
      jobs.map(async (job) => {
        let matchScore = 50; // Base score
        
        // Style match
        const instructorStyles = instructorProfile.fitness_styles || [];
        const jobStyles = job.styles || [];
        const styleMatch = jobStyles.some(s => instructorStyles.includes(s));
        if (styleMatch) matchScore += 25;
        
        // Certification match
        const instructorCerts = instructorProfile.certifications || [];
        const jobRequirements = job.requirements || [];
        const certMatch = jobRequirements.some(r => instructorCerts.includes(r));
        if (certMatch) matchScore += 15;
        
        // Location match (basic - could use geolocation)
        if (job.location && instructorProfile.location) {
          if (job.location.toLowerCase().includes(instructorProfile.location.toLowerCase())) {
            matchScore += 10;
          }
        }
        
        // Experience level match
        const expYears = instructorProfile.years_of_experience || 0;
        if (expYears >= 5) matchScore += 5;
        
        // Check if already applied
        const appStatus = await getApplicationStatus(job.id, instructorId);
        
        return {
          ...job,
          matchScore: Math.min(100, matchScore),
          hasApplied: appStatus.hasApplied,
          applicationStatus: appStatus.status,
        } as EnhancedJobWithStudio;
      })
    );
    
    // Sort by match score
    return jobsWithScore.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } catch (error) {
    console.error("Error fetching jobs with match score:", error);
    throw new Error("Failed to fetch jobs");
  }
}

/**
 * Accept an application and optionally send a message
 */
export async function acceptApplication(
  applicationId: string,
  jobId: string,
  sendMessage: boolean = true
): Promise<void> {
  try {
    await updateApplicationStatus(applicationId, "accepted");
    
    // Close other applications for this job if this fills the position
    // (Optional: could make this configurable)
    
  } catch (error) {
    console.error("Error accepting application:", error);
    throw new Error("Failed to accept application");
  }
}

/**
 * Shortlist an application
 */
export async function shortlistApplication(applicationId: string): Promise<void> {
  try {
    const appRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await updateDoc(appRef, {
      status: "shortlisted",
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error shortlisting application:", error);
    throw new Error("Failed to shortlist application");
  }
}
