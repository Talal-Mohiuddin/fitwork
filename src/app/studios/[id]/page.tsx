"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Bookmark,
  ExternalLink,
  Instagram,
  Star,
  Music,
  Award,
  MapPinIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getStudioById } from "@/services/studioService";
import { getJobs } from "@/services/jobService";
import { Profile, StudioProfileSetup, JobWithStudio } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/firebase-auth-provider";
import { getOrCreateConversation } from "@/services/chatService";

// Combined type for studio detail that includes all possible fields
type StudioDetail = Profile & Partial<StudioProfileSetup>;

export default function StudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.id as string;
  const { user, profile } = useAuth();

  const [studio, setStudio] = useState<StudioDetail | null>(null);
  const [jobs, setJobs] = useState<JobWithStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        setLoading(true);
        const studioData = await getStudioById(studioId);
        if (!studioData) {
          setError("Studio not found");
        } else {
          setStudio(studioData);
          
          // Fetch open jobs for this studio
          try {
            setJobsLoading(true);
            const { jobs: studioJobs } = await getJobs({
              studioId: studioId,
              status: "open",
              limitCount: 10,
            });
            setJobs(studioJobs);
          } catch (jobErr) {
            console.error("Error fetching jobs:", jobErr);
            setJobs([]);
          } finally {
            setJobsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching studio:", err);
        setError("Failed to load studio details");
      } finally {
        setLoading(false);
      }
    };

    fetchStudio();
  }, [studioId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Studio not found"}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const mainImage = studio.images?.[0] || studio.logo || "https://via.placeholder.com/1200x400";
  const galleryImages = studio.images?.slice(1, 5) || [];

  const handleScrollToJobs = () => {
    document.getElementById('open-gigs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageStudio = async () => {
    if (!user || !profile) {
      router.push(`/login?redirect=/studios/${studioId}`);
      return;
    }

    try {
      const studioName = studio.name || "Studio";
      const studioImage = studio.images?.[0] || studio.logo;
      
      // Prevent messaging self
      if (user.uid === studioId) {
        alert("You cannot message yourself");
        return;
      }

      const conversation = await getOrCreateConversation(
        user.uid,
        studioId,
        {
          name: profile.full_name || profile.name || "User",
          avatar: profile.photo_url || undefined,
          userType: (profile.user_type as "studio" | "instructor") || "instructor"
        },
        {
          name: studioName,
          avatar: studioImage || undefined,
          userType: "studio"
        }
      );
      
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      alert("Failed to start conversation. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/studios" className="hover:text-primary transition-colors">
            Studios
          </Link>
          <span>/</span>
          <span className="text-text-main dark:text-white font-medium">
            {studio.name}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
        <Image
          src={mainImage}
          alt={studio.name || "Studio"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

        {/* Studio Logo & Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            {studio.logo && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg shrink-0">
                <Image
                  src={studio.logo}
                  alt={studio.name || "Logo"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {studio.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                {studio.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{studio.location}</span>
                  </div>
                )}
                {studio.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{studio.rating}</span>
                    <span className="text-sm">({studio.review_count || 0})</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsSaved(!isSaved)}
              variant="outline"
              className="bg-white/90 hover:bg-white border-white"
            >
              <Bookmark
                className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
              />
              Save Studio
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Claim Badge & High Demand */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm py-1.5 px-4">
                Claim this Studio
              </Badge>
              {studio.rating && studio.rating >= 4.5 && (
                <Badge className="bg-primary text-[#111813] text-sm py-1.5 px-4">
                  🔥 High Demand
                </Badge>
              )}
              {studio.styles && studio.styles.length > 1 && (
                <Badge variant="outline" className="text-sm py-1.5 px-4">
                  📍 Multiple Locations
                </Badge>
              )}
            </div>

            {/* About the Studio */}
            <section>
              <h2 className="text-2xl font-bold text-text-main dark:text-white mb-4">
                About the Studio
              </h2>
              <p className="text-text-muted leading-relaxed">
                {studio.description ||
                  "This studio is a modern movement sanctuary. We blend traditional practices with contemporary science to create a holistic fitness experience. Our space is designed with Nordic minimalism in mind—clean lines, natural light, and sustainable materials. We pride ourselves on building a community of instructors who are passionate about biomechanics and mindful movement."}
              </p>
            </section>

            {/* Class Types */}
            {studio.styles && studio.styles.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">
                  CLASS TYPES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studio.styles.map((style) => (
                    <Badge
                      key={style}
                      variant="outline"
                      className="text-sm py-1.5 px-4"
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities & Equipment */}
            <div className="grid md:grid-cols-2 gap-6">
              {studio.amenities && studio.amenities.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">
                    AMENITIES
                  </h3>
                  <ul className="space-y-2">
                    {studio.amenities.map((amenity) => (
                      <li
                        key={amenity}
                        className="flex items-start gap-2 text-text-muted"
                      >
                        <span className="text-primary mt-1">✓</span>
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {studio.tools_equipment && studio.tools_equipment.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">
                    EQUIPMENT
                  </h3>
                  <ul className="space-y-2">
                    {studio.tools_equipment.map((item: string) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-text-muted"
                      >
                        <span className="text-primary mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Studio Gallery */}
            {galleryImages.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-text-main dark:text-white">
                    Studio Gallery
                  </h2>
                  <button className="text-sm text-primary hover:underline">
                    View All Photos
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800"
                    >
                      <Image
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Music & Vibe */}
            {studio.music_policy && (
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3 mb-4">
                  <Music className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-text-main dark:text-white">
                    Music & Vibe
                  </h3>
                </div>
                <p className="text-text-muted mb-4">
                  {studio.music_policy === 'instructor_choice'
                    ? 'Instructors have full control over music selection for their classes.'
                    : studio.music_policy === 'studio_playlist'
                    ? 'We provide curated studio playlists for all classes.'
                    : 'Mixed model - some classes use instructor choice, others use studio playlists.'}
                </p>
                {studio.instagram && (
                  <a
                    href={`https://instagram.com/${studio.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Music className="w-4 h-4" />
                    Follow us on Instagram
                  </a>
                )}
              </section>
            )}

            {/* Onboarding */}
            {studio.onboarding_requirements && (
              <section className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-text-main dark:text-white">
                    Onboarding
                  </h3>
                </div>
                <p className="text-text-muted mb-4">
                  {studio.onboarding_requirements.audition_required
                    ? "Audition class required. "
                    : ""}
                  {studio.onboarding_requirements.paid_training
                    ? "Successful candidates receive a paid 2-week mentorship program with our Lead Instructor."
                    : ""}
                </p>
                {studio.onboarding_requirements.paid_training && (
                  <Badge className="bg-green-500 text-white">
                    ✓ Paid Training
                  </Badge>
                )}
              </section>
            )}

            {/* Map */}
            {studio.location && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <MapPinIcon className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-text-main dark:text-white">
                    View on Map
                  </h3>
                </div>
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-text-muted">Map integration coming soon</p>
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pay Transparency */}
            {(studio.pay_model || studio.pay_transparency || studio.base_pay_min) && (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                  PAY TRANSPARENCY
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-black text-text-main dark:text-white">
                      {studio.base_pay_min && studio.base_pay_max
                        ? `€${studio.base_pay_min}-${studio.base_pay_max}`
                        : "Competitive"}
                    </p>
                    <p className="text-sm text-text-muted">
                      {studio.pay_model === 'flat_rate' ? '/ class flat rate'
                        : studio.pay_model === 'tiered' ? '/ class tiered'
                        : studio.pay_model === 'hourly' ? '/ hour'
                        : "/ class avg"}
                    </p>
                  </div>
                  {studio.pay_transparency && (
                    <p className="text-sm text-text-muted leading-relaxed">
                      {typeof studio.pay_transparency === 'string' 
                        ? studio.pay_transparency 
                        : 'We believe in transparent compensation for our instructors.'}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleScrollToJobs}
                  className="w-full mt-6 bg-primary hover:bg-primary-hover text-[#111813] font-bold"
                >
                  View Open Gigs
                </Button>
                <Button 
                  onClick={handleMessageStudio}
                  variant="outline" 
                  className="w-full mt-3"
                >
                  Message Studio
                </Button>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                CONTACT
              </h3>
              <div className="space-y-3">
                {studio.website && (
                  <a
                    href={studio.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
                {studio.instagram && (
                  <a
                    href={`https://instagram.com/${studio.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">@{studio.instagram}</span>
                  </a>
                )}
                {studio.street_address && (
                  <div className="flex items-start gap-2 text-text-muted">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div className="text-sm">
                      <p>{studio.street_address}</p>
                      {studio.city && studio.state && studio.zip_code && (
                        <p>
                          {studio.city}, {studio.state} {studio.zip_code}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Why Instructors Love Us */}
            {studio.additional_perks && studio.additional_perks.length > 0 && (
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                  Why instructors love us
                </h3>
                <ul className="space-y-3">
                  {studio.additional_perks.map((perk: string) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-sm text-text-muted">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Open Gigs Section */}
        <section id="open-gigs" className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-main dark:text-white">
              Open Gigs
            </h2>
            <span className="text-sm text-primary font-semibold">
              {jobs.length} position{jobs.length !== 1 ? 's' : ''} available
            </span>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted mb-2">No open positions at the moment</p>
              <p className="text-sm text-text-muted">Check back soon for new opportunities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-primary transition-colors">
                          {job.position}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">{job.description}</p>
                      </div>
                      <Button className="bg-primary hover:bg-primary-hover text-[#111813] font-bold shrink-0 ml-4">
                        View & Apply
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          {job.compensation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted">
                          {job.start_date && `Starts ${new Date(job.start_date).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.styles?.slice(0, 2).map((style) => (
                          <Badge key={style} variant="outline" className="text-xs py-1 px-2">
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {jobs.length > 0 && (
            <div className="text-center mt-8">
              <Link href={`/jobs?studioId=${studioId}`}>
                <button className="text-sm text-primary hover:underline font-semibold">
                  View All Open Gigs →
                </button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
