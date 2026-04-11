"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore, UserProfile } from "@/store/useAuthStore";
import { toast } from "sonner";

function CallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const userStr = searchParams.get("user");

    if (!accessToken || !userStr) {
      toast.error("Authentication failed or missing token");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr)) as UserProfile;

      Cookies.set("access_token", accessToken);
      if (refreshToken) {
        Cookies.set("refresh_token", refreshToken);
      }

      setUser(user);
      toast.success("Logged in successfully!");

      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "builder") {
        router.push("/sell");
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
      toast.error("Authentication data is corrupted");
      router.push("/login");
    }
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

