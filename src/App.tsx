import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AttendanceModule from "./pages/modules/AttendanceModule";
import EmotionModule from "./pages/modules/EmotionModule";
import RetinalModule from "./pages/modules/RetinalModule";
import GestureModule from "./pages/modules/GestureModule";
import AuthenticityModule from "./pages/modules/AuthenticityModule";
import AnalyticsModule from "./pages/modules/AnalyticsModule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/module/attendance" element={<ProtectedRoute><AttendanceModule /></ProtectedRoute>} />
            <Route path="/module/emotion" element={<ProtectedRoute><EmotionModule /></ProtectedRoute>} />
            <Route path="/module/retinal" element={<ProtectedRoute><RetinalModule /></ProtectedRoute>} />
            <Route path="/module/gesture" element={<ProtectedRoute><GestureModule /></ProtectedRoute>} />
            <Route path="/module/authenticity" element={<ProtectedRoute><AuthenticityModule /></ProtectedRoute>} />
            <Route path="/module/analytics" element={<ProtectedRoute><AnalyticsModule /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
