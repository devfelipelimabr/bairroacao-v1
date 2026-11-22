import { Routes, Route, useLocation, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import MapView from "@/pages/MapView";
import Decisions from "@/pages/Decisions";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/feed" replace />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
