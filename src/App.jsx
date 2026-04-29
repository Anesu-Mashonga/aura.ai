import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./layout/ProtectedRoute";
import AppShell from "./layout/AppShell/AppShell";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import WardrobePage from "./pages/Wardrobe/WardrobePage";
import ExplorePage from "./pages/Explore/ExplorePage";
import LaundryPage from "./pages/Laundry/LaundryPage";
import FavoriteStylesPage from "./pages/FavoriteStyles/FavoriteStylesPage";
import HistoryPage from "./pages/History/HistoryPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import { useEffect } from "react";
import { wardrobeService } from "./services/wardrobeService";

function AppInit({ children }) {
  useEffect(() => {
    wardrobeService.seedInitialDataIfEmpty();
  }, []);
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInit>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="wardrobe" element={<WardrobePage />} />
                <Route path="favorites" element={<FavoriteStylesPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="laundry" element={<LaundryPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AppInit>
      </ThemeProvider>
    </AuthProvider>
  );
}
