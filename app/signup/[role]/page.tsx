"use client";
import { useState, use } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { useAuthStore, UserProfile } from "@/store/useAuthStore";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    role: "individual" | "builder";
  }>;
}

export default function Signup({ params }: PageProps) {
  const { role } = use(params);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  // Basic validation on the client side
  if (typeof window !== "undefined" && role !== "individual" && role !== "builder") {
    router.push("/signup");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authService.register({
        email,
        password,
        name,
        role,
      });
      toast.success("Account created successfully!");

      // Store tokens
      Cookies.set("access_token", data.access_token);
      if (data.refresh_token) {
        Cookies.set("refresh_token", data.refresh_token);
      }

      // Map the backend user to UserProfile
      const profile = data.user as unknown as UserProfile;
      setUser(profile);

      // Redirect
      if (profile.role === "admin") {
        router.push("/admin");
      } else if (profile.role === "builder") {
        router.push("/sell");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const roleDisplay = role === "builder" ? "Builder" : "Individual";

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A192F] flex items-center justify-center relative overflow-hidden selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 px-4"
      >
        <Link 
          href="/signup" 
          className="inline-flex items-center text-white/40 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Change Role
        </Link>

        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle Inner Rim */}
          <div className="absolute inset-0 border border-amber-500/5 rounded-[40px] pointer-events-none" />

          <div className="text-center mb-10 space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-amber-500 text-[9px] font-bold tracking-[0.4em] uppercase">
                {roleDisplay} Registration
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
              Create <span className="text-white/40 italic font-light">Legacy</span>
            </h1>
            <p className="text-white/30 text-sm font-light leading-relaxed">
              Join our exclusive network of estates as a {roleDisplay.toLowerCase()}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/50 transition-all" 
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/50 transition-all" 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/50 transition-all" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/10 mt-4 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <>
                  Establish Account <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              )}
            </Button>
          </form>

          {/* Social Access */}
          <div className="mt-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Third-Party Registration</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={`${API_URL}/auth/google?role=${role}`}
                className="flex items-center justify-center h-12 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                Google
              </a>
              <a 
                href={`${API_URL}/auth/linkedin?role=${role}`}
                className="flex items-center justify-center h-12 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:border-white/10 transition-all"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 mt-10">
            Registered member?{" "}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
