import { Suspense } from "react";
import JustForYou from "./JustForYou";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JustForYou />
    </Suspense>
  );
}