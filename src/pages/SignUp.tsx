import { SignUp, useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

import AuthShell, { AuthFormLoader } from "../components/AuthShell";
import { clerkAppearance } from "../lib/clerkAppearance";

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) return <Navigate to="/" replace />;

  return (
    <AuthShell
      heading="Create your account"
      text="Set up your staff account. An administrator will need to approve it before you can open the dashboard."
    >
      {!isLoaded ? (
        <AuthFormLoader />
      ) : (
        <SignUp
          routing="path"
          path="/signup"
          appearance={clerkAppearance}
          signInUrl="/login"
          signInFallbackRedirectUrl="/"
          fallbackRedirectUrl="/"
        />
      )}
    </AuthShell>
  );
}
