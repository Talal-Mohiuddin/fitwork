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
  experience_years?: number;
  classes_taught?: number;
  gallery_images?: string[];
  hourly_rate?: number;
  class_rate?: string;
  available?: boolean;
  video_url?: string;

  // Studio-specific fields for instructor expectations and compensation
  experience_level?: string;
  pay_structure?: string;
}

export interface Job {
  id: string;
  studio_id: string;
  position: string;
  description: string;
  requirements?: string[];
  start_date: string;
  end_date?: string | null;
  time_slot?: string;
  compensation: string;
  styles: string[];
  created_at: string;
  status: "open" | "closed";
  urgent?: boolean;
  location?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  applied_at: string;
  status: "pending" | "accepted" | "rejected" | "invited" | "shortlisted" | "offered" | "withdrawn";
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
  status?: "pending" | "accepted" | "rejected" | "invited" | "shortlisted" | "offered" | "withdrawn";
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

// Guest Spot types
export interface GuestSpot {
  id: string;
  studio_id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  duration_type: "single_class" | "workshop" | "weekend" | "week" | "retreat" | "series";
  styles: string[];
  compensation: string;
  accommodations_provided?: boolean;
  travel_covered?: boolean;
  requirements?: string[];
  min_experience?: string;
  created_at: string;
  status: "open" | "filled" | "cancelled";

  // Additional benefits
  promo_support?: boolean;
  meals_included?: boolean;
  studio_perks?: boolean;
  featured_instructor?: boolean;
  local_transport?: boolean;
  content_provided?: boolean;
  public_event?: boolean;
}

export interface GuestSpotWithStudio extends GuestSpot {
  studio: {
    id: string;
    name: string | null;
    location: string | null;
    images: string[] | null;
  };
  applications?: GuestSpotApplication[];
  application_count?: number;
}

export interface GuestSpotApplication {
  id: string;
  guest_spot_id: string;
  applicant_id: string;
  applied_at: string;
  status: "pending" | "accepted" | "rejected" | "invited";
  message?: string;
  type?: "invite" | "apply";
  proposed_rate?: string;
}

export interface GuestSpotApplicationWithDetails extends GuestSpotApplication {
  guest_spot: GuestSpotWithStudio;
  applicant?: Profile;
}

export interface GuestSpotApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: "pending" | "accepted" | "rejected" | "invited";
}

// Studio Details type with related data
export type StudioDetails = {
  id: string;
  email: string;
  user_type: mode;

  // Studio profile fields
  name?: string;
  tagline?: string;
  location?: string;
  description?: string;
  phone_number?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  styles?: string[];
  amenities?: string[];
  hiring_types?: string[];
  images?: string[];

  // Rating fields
  rating?: number;
  review_count?: number;
  view_count?: number;

  // Related data
  reviews?: Review[];
  instructors?: Profile[];
  openPositions?: Job[];
  guestSpots?: GuestSpot[];

  // Other fields
  created_at?: string;
  profile_completed?: boolean;
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
};

// Studio claim token
export interface StudioClaimToken {
  id: string;
  studio_id: string;
  token: string;
  created_at: string;
  expires_at: string;
  claimed: boolean;
  claimed_by?: string;
  claimed_at?: string;
}

// Extended Studio Profile for setup page
export interface StudioProfileSetup extends Profile {
  // Identity & Brand
  logo?: string;
  studio_name?: string;
  about_studio?: string;

  // Contact & Location
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Class Styles & Amenities
  class_types?: string[];
  member_amenities?: string[];

  // Instructor Experience
  music_policy?: 'instructor_choice' | 'studio_playlist' | 'mixed_model';
  tools_equipment?: string[];
  onboarding_requirements?: {
    audition_required?: boolean;
    paid_training?: boolean;
  };

  // Compensation & Perks
  pay_transparency?: boolean;
  base_pay_min?: number;
  base_pay_max?: number;
  pay_model?: 'flat_rate' | 'tiered' | 'hourly';
  additional_perks?: string[];

  // Studio Gallery
  gallery_photos?: string[];

  // Status
  status?: 'draft' | 'published';
  last_saved?: string;
}

// ==================== CHAT TYPES ====================

export interface Conversation {
  id: string;
  participants: string[]; // [studioId, instructorId]
  participantDetails: {
    [key: string]: {
      name: string;
      avatar?: string;
      userType: mode;
    };
  };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
    type: MessageType;
  };
  unreadCount: {
    [key: string]: number;
  };
  created_at: string;
  updated_at: string;
}

export type MessageType = 'text' | 'job_offer' | 'gig_invite' | 'application_update' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: MessageType;
  read: boolean;
  jobOffer?: JobOfferDetails;
  gigInvite?: GigInviteDetails;
}

export interface JobOfferDetails {
  jobId: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  studio: string;
  studioId: string;
  rate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  classType?: string;
}

export interface GigInviteDetails {
  jobId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  studio: string;
  studioId: string;
  rate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// ==================== ENHANCED JOB TYPES ====================

export type ClassType = 
  | 'Spin' 
  | 'HIIT' 
  | 'Yoga' 
  | 'Pilates' 
  | 'Barre' 
  | 'Boxing' 
  | 'Strength' 
  | 'Dance'
  | 'Cycling'
  | 'Functional'
  | 'CrossFit'
  | 'Swimming'
  | 'Other';

export type PayType = 'flat_fee' | 'hourly' | 'range';
export type EmploymentStatus = 'contractor' | 'employee';
export type CancellationPolicy = 'standard' | 'flexible' | 'strict';
export type ExperienceLevel = 'junior' | 'established' | 'expert';

export interface JobPostingData {
  // Step 1: Class Type
  classType: ClassType;
  customClassType?: string;

  // Step 2: Schedule & Location
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  location: string;
  studioAddress?: string;
  coordinates?: { lat: number; lng: number };

  // Step 3: Pay & Contract
  payType: PayType;
  payAmount?: number;
  payMin?: number;
  payMax?: number;
  currency: string;
  employmentStatus: EmploymentStatus;
  cancellationPolicy: CancellationPolicy;

  // Step 4: Requirements & Details
  certificationsRequired: string[];
  experienceLevel: ExperienceLevel;
  notes?: string;

  // Visibility
  visibility: 'public' | 'bench_only';
}

export interface EnhancedJob extends Job {
  classType?: ClassType;
  customClassType?: string;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  studioAddress?: string;
  payType?: PayType;
  payAmount?: number;
  payMin?: number;
  payMax?: number;
  currency?: string;
  employmentStatus?: EmploymentStatus;
  cancellationPolicy?: CancellationPolicy;
  certificationsRequired?: string[];
  experienceLevel?: ExperienceLevel;
  notes?: string;
  visibility?: 'public' | 'bench_only';
  applicantCount?: number;
  matchScore?: number;
}

export interface EnhancedJobWithStudio extends EnhancedJob {
  studio: {
    id?: string;
    name: string | null;
    location: string | null;
    images: string[] | null;
    rating?: number;
    description?: string;
  };
  applications: JobApplication[];
  hasApplied?: boolean;
  applicationStatus?: string;
}

// ==================== STUDIO BENCH (SAVED INSTRUCTORS) ====================

export interface BenchInstructor {
  id: string;
  studioId: string;
  instructorId: string;
  addedAt: string;
  notes?: string;
  tags?: string[];
  lastContacted?: string;
  instructor?: Profile;
}

// ==================== DASHBOARD STATS ====================

export interface StudioDashboardStats {
  openGigs: number;
  openGigsChange: number;
  newApplicants: number;
  activeClasses: number;
  responseRate?: number;
  avgTimeToFill?: number;
}
