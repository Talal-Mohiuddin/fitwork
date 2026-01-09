export type mode = "instructor" | "studio";
export type SubscriptionTier = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "inactive" | "canceled";

export interface Review {
  id: string | number;
  reviewer_id: string;
  reviewee_id: string;
  content: string;
  rating: number;
  date: string;
  reviewer_type: "studio" | "instructor";
  reviewer_name?: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  isActive: boolean;
}

export interface Certification {
  title: string;
  issued: string;
  icon: string;
}

export interface Profile {
  id: string;
  email: string;
  user_type: mode;
  created_at?: string;
  location?: string;
  profile_completed?: boolean;

  // Subscription fields
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  stripe_customer_id?: string;

  // Studio specific fields
  name?: string;
  tagline?: string;
  description?: string;
  phone_number?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  styles?: string[];
  amenities?: string[];
  hiring_types?: string[];
  images?: string[];
  instructors?: string[] | null;

  // Instructor specific fields
  full_name?: string;
  headline?: string;
  bio?: string;
  contact_number?: string;
  date_of_birth?: Date;
  travel_preference?: string;
  postal_code?: string;
  availability_slots?: string[];
  certifications?: string[];
  other_certifications?: string;
  fitness_styles?: string[];
  referral_source?: string;
  profile_photo?: string;
  open_to_work?: boolean;

  // New instructor guest spot fields
  open_to_guest_spots?: boolean;
  touring_ready?: boolean;
  guest_spot_rate?: string;
  travel_accommodations_needed?: boolean;
  self_arrange_travel_with_reimbursement?: boolean;
  preferred_guest_cities?: string[];
  travel_availability?: string;

  // Rating and reviews fields
  rating?: number;
  reviews?: Review[];
  review_count?: number;

  // Profile views tracking
  view_count?: number;

  // New instructor-specific fields
  experience?: Experience[];
  certification_details?: Certification[];
  years_of_experience?: number;
  classes_taught?: number;
  gallery_images?: string[];
  hourly_rate?: number;
  class_rate?: string;
}

export interface Job {
  id: string;
  studio_id: string;
  position: string;
  description: string;
  requirements?: string[];
  start_date: string;
  end_date?: string | null;
  compensation: string;
  styles: string[];
  created_at: string;

  status: "open" | "closed";
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  applied_at: string;
  status: "pending" | "accepted" | "rejected" | "invited";
  message?: string;
  type?: "invite" | "apply";
}

export interface JobApplicationWithDetails extends JobApplication {
  job: JobWithStudio;
  applicant?: Profile;
}

export interface ApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: "pending" | "accepted" | "rejected" | "invited";
}

export interface JobWithStudio extends Job {
  studio: {
    name: string | null;
    location: string | null;
    images: string[] | null;
  };
  applications: [];
}

export interface savedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
}

export interface savedProfile {
  id: string;
  user_id: string;
  profile_id: string;
  saved_at: string;
}
