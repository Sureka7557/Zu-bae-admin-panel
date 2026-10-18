import { RedirectToSignIn, useAuth, useUser } from "@clerk/react";
import { Outlet } from "react-router-dom";

import AccessDenied from "../pages/AccessDenied";
import FullScreenLoader from "./FullScreenLoader";

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  // Clerk is still starting up, or the user record hasn't arrived yet.
  // Always show the branded loader here so the screen is never blank.
  if (!isLoaded || (isSignedIn && !userLoaded)) {
    return <FullScreenLoader label="Preparing your dashboard…" />;
  }

  if (!isSignedIn) {
    return (
      <>
        <FullScreenLoader label="Redirecting to sign in…" />
        <RedirectToSignIn />
      </>
    );
  }

  if (user?.publicMetadata?.role !== "admin") {
    return <AccessDenied />;
  }

  return <Outlet />;
}
