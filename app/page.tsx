import { Suspense } from "react";
import HomePage from "./HomePage";
import LoadingScreen from "@/components/LoadingScreen"; // Adjust path if necessary

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  );
}