"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { claimStudio, getClaimToken, getStudioById } from "@/services/studioService";
import { useAuth } from "@/store/firebase-auth-provider";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types";

function ClaimStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams?.get("token");

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [studio, setStudio] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("No claim token provided");
        setLoading(false);
        return;
      }

      try {
        const tokenData = await getClaimToken(token);
        if (!tokenData) {
          setError("Invalid claim token");
          setLoading(false);
          return;
        }

        if (tokenData.claimed) {
          setError("This studio has already been claimed");
          setLoading(false);
          return;
        }

        const now = new Date();
        if (new Date(tokenData.expires_at) < now) {
          setError("This claim token has expired");
          setLoading(false);
          return;
        }

        // Fetch studio details
        const studioData = await getStudioById(tokenData.studio_id);
        setStudio(studioData);
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("Failed to verify claim token");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleClaim = async () => {
    if (!user || !token) return;

    setClaiming(true);
    setError(null);

    try {
      const result = await claimStudio(token, user.uid, user.email || "");

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/studio");
        }, 3000);
      } else {
        setError(result.error || "Failed to claim studio");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to claim studio";
      setError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white mb-4">
            Studio Claimed Successfully!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You are now the owner of {studio?.name}. Redirecting to your dashboard...
          </p>
          <Link href="/dashboard/studio">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white mb-4">
            Unable to Claim Studio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href="/signup?mode=studio">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Create New Studio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              {studio?.images?.[0] ? (
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={studio.images[0]}
                    alt={studio.name || "Studio"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                Claim Your Studio
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                You&apos;ve been invited to claim {studio?.name || "this studio"}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You need to log in or create an account to claim this studio.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/login?redirect=/claim-studio?token=${token}`}>
                <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                  Log In to Claim
                </Button>
              </Link>
              <Link href={`/signup?mode=studio&redirect=/claim-studio?token=${token}`}>
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in, show claim confirmation
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            {studio?.images?.[0] ? (
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src={studio.images[0]}
                  alt={studio.name || "Studio"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">
              Claim {studio?.name || "Studio"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              You&apos;re about to become the owner of this studio
            </p>
          </div>

          {studio && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-text-main dark:text-white mb-2">
                Studio Details
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> {studio.name}
                </p>
                {studio.location && (
                  <p>
                    <strong>Location:</strong> {studio.location}
                  </p>
                )}
                {studio.tagline && (
                  <p>
                    <strong>Tagline:</strong> {studio.tagline}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              As the studio owner, you&apos;ll be able to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Post job listings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Create guest spot opportunities
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Manage applications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Update studio profile
              </li>
            </ul>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary-dark text-white"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming Studio...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Claim This Studio
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClaimStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ClaimStudioContent />
    </Suspense>
  );
}
