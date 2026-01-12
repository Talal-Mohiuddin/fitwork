"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { StudioProfileSetup } from "@/types";
import { getStudioProfileSetup, saveStudioProfileSetup } from "@/services/studioService";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Check, Eye, FileText, Loader2 } from "lucide-react";

// Section Components
import IdentityBrandSection from "./_components/IdentityBrandSection";
import ContactLocationSection from "./_components/ContactLocationSection";
import ClassStylesSection from "./_components/ClassStylesSection";
import InstructorExperienceSection from "./_components/InstructorExperienceSection";
import CompensationPerksSection from "./_components/CompensationPerksSection";
import StudioGallerySection from "./_components/StudioGallerySection";

type SectionKey = 'identity' | 'contact' | 'class_styles' | 'instructor_exp' | 'compensation' | 'gallery';

interface SectionStatus {
  key: SectionKey;
  label: string;
  icon: string;
  completed: boolean;
}

export default function StudioProfileSetupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<StudioProfileSetup>({
    id: "",
    email: "",
    user_type: "studio",
    status: "draft",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('identity');

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const existingProfile = await getStudioProfileSetup(user.uid);
        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          setProfile({
            ...profile,
            id: user.uid,
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!loading && user) {
      loadProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Calculate completion percentage
  const calculateProgress = (): number => {
    const sections = getSectionStatus();
    const completed = sections.filter(s => s.completed).length;
    return Math.round((completed / sections.length) * 100);
  };

  // Get section completion status
  const getSectionStatus = (): SectionStatus[] => {
    return [
      {
        key: 'identity',
        label: 'Identity',
        icon: '✓',
        completed: !!(profile.logo && profile.studio_name && profile.about_studio),
      },
      {
        key: 'contact',
        label: 'Contact & Location',
        icon: '📍',
        completed: !!(profile.street_address && profile.city && profile.state && profile.zip_code),
      },
      {
        key: 'class_styles',
        label: 'Class Styles',
        icon: '🏋️',
        completed: !!(profile.class_types && profile.class_types.length > 0),
      },
      {
        key: 'instructor_exp',
        label: 'Instructor Info',
        icon: '👨‍🏫',
        completed: !!(profile.music_policy && profile.tools_equipment && profile.tools_equipment.length > 0),
      },
      {
        key: 'compensation',
        label: 'Compensation',
        icon: '💰',
        completed: !!(profile.base_pay_min && profile.base_pay_max && profile.pay_model),
      },
      {
        key: 'gallery',
        label: 'Gallery',
        icon: '📸',
        completed: !!(profile.gallery_photos && profile.gallery_photos.length > 0),
      },
    ];
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await saveStudioProfileSetup(user.uid, { ...profile, status: 'draft' }, true);
      toast({
        title: "Draft Saved",
        description: "Your profile has been saved as a draft",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish profile
  const handlePublish = async () => {
    if (!user) return;

    const sections = getSectionStatus();
    const incomplete = sections.filter(s => !s.completed);
    
    if (incomplete.length > 0) {
      toast({
        title: "Incomplete Profile",
        description: `Please complete: ${incomplete.map(s => s.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveStudioProfileSetup(user.uid, { ...profile, status: 'published' }, false);
      toast({
        title: "Profile Published",
        description: "Your studio profile is now live!",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error("Error publishing profile:", error);
      toast({
        title: "Error",
        description: "Failed to publish profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update profile data
  const updateProfile = (updates: Partial<StudioProfileSetup>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const sections = getSectionStatus();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Progress */}
          <div className="w-64 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="font-semibold text-lg mb-4">Profile Steps</h2>
              <p className="text-sm text-gray-600 mb-4">Complete all sections to publish</p>
              
              <div className="space-y-3 mb-6">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      activeSection === section.key
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      section.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {section.completed ? <Check className="w-4 h-4" /> : section.icon}
                    </div>
                    <span className="text-sm font-medium text-left">{section.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Your Studio Profile</h1>
                <p className="text-gray-600">
                  Build your talent OS. Attract the best instructors with transparency and operational clarity.
                </p>
              </div>

              {/* Section Content */}
              <div className="space-y-8">
                {activeSection === 'identity' && (
                  <IdentityBrandSection profile={profile} updateProfile={updateProfile} />
                )}
                {activeSection === 'contact' && (
                  <ContactLocationSection profile={profile} updateProfile={updateProfile} />
                )}
                {activeSection === 'class_styles' && (
                  <ClassStylesSection profile={profile} updateProfile={updateProfile} />
                )}
                {activeSection === 'instructor_exp' && (
                  <InstructorExperienceSection profile={profile} updateProfile={updateProfile} />
                )}
                {activeSection === 'compensation' && (
                  <CompensationPerksSection profile={profile} updateProfile={updateProfile} />
                )}
                {activeSection === 'gallery' && (
                  <StudioGallerySection profile={profile} updateProfile={updateProfile} />
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Preview functionality
                      toast({
                        title: "Preview",
                        description: "Preview functionality coming soon",
                      });
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isSaving || progress < 100}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Publish Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
