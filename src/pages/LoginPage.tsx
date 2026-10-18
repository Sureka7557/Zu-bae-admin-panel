import { SignIn, useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

import AuthShell, { AuthFormLoader } from "../components/AuthShell";
import { clerkAppearance } from "../lib/clerkAppearance";

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();

  // Already signed in (or just finished signing in): go straight to the app.
  if (isLoaded && isSignedIn) return <Navigate to="/" replace />;

  return (
    <AuthShell
      heading="Welcome back"
      text="Sign in to manage your products, orders and customers from one place."
    >
      {!isLoaded ? (
        <AuthFormLoader />
      ) : (
        <SignIn
          routing="path"
          path="/login"
          appearance={clerkAppearance}
          signUpUrl="/signup"
          fallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        />
      )}
    </AuthShell>
  );
}
