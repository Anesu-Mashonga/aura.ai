import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";
import { isOnboardingComplete } from "../data/styleProfileData";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (!user) return <Navigate to="/login" replace />;

  const onboardingDone = isOnboardingComplete(user);
  const isOnboardingPath = location.pathname === "/onboarding";

  if (!onboardingDone && !isOnboardingPath) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingDone && isOnboardingPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
