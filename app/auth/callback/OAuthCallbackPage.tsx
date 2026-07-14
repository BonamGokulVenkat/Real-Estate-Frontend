"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore, UserProfile } from "@/store/useAuthStore";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

/**
 * After an OAuth login, the backend sets HttpOnly cookies and redirects here
 * with only a ?role= query param (non-sensitive, used only for routing).
 *
 * We then call GET /auth/me, which reads the HttpOnly cookie server-side,
 * verifies the JWT, and returns the sanitized user profile.
 */
function CallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const role = searchParams.get("role");

    async function hydrateUser() {
      try {
        // The HttpOnly access_token cookie is sent automatically by the browser
        // because apiClient has withCredentials: true.
        const { data: user } = await apiClient.get<UserProfile>("/auth/me");

        setUser(user);
        toast.success("Logged in successfully!");

        // Route based on role from the backend response (authoritative)
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "builder") {
          router.push("/sell");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("OAuth callback — failed to fetch user profile:", err);
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
      }
    }

    // Guard: if there's no role param at all, something went wrong before redirect
    if (!role) {
      toast.error("Authentication failed or missing session");
      router.push("/login");
      return;
    }

    hydrateUser();
  }, [router, searchParams, setUser]);

  return (
    <div className="text-center z-10 space-y-4">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
      <h2 className="text-white text-xl font-medium tracking-wide">
        Authenticating...
      </h2>
      <p className="text-white/40 text-sm">Please wait while we log you in</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <Suspense fallback={<Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto z-10" />}>
        <CallbackLogic />
      </Suspense>
    </div>
  );
}
