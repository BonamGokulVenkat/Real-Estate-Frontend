import { Suspense } from "react";
import OAuthCallbackPage from "./OAuthCallbackPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Authenticating...</div>}>
      <OAuthCallbackPage />
    </Suspense>
  );
}