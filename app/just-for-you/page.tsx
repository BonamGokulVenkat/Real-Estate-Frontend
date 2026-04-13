import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import JustForYou from "./JustForYou";

export const metadata = {
  title: "Just For You",
  description: "Browse curated luxury property listings filtered to your preferences.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <JustForYou />
    </Suspense>
  );
}