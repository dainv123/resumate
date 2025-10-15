"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have token and user data from backend redirect
        const token = searchParams.get("token");
        const name = searchParams.get("name");
        const email = searchParams.get("email");
        const avatar = searchParams.get("avatar");
        const id = searchParams.get("id");
        const plan = searchParams.get("plan");

        if (token && id && name && email && plan) {
          // Store token and user data
          if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
          }

          // Update auth context - set user directly
          updateUser({
            id,
            name,
            email,
            avatar: avatar || undefined,
            plan: plan as "free" | "pro",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          router.push("/dashboard");
        } else {
          setError(t("auth.authFailed"));
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(t("auth.authFailed"));
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, router, updateUser, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
      <AuthCallbackContent />
    </Suspense>
  );
}
