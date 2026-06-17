import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/auth";
import { AppDataProvider } from "@/lib/appData";
import { isFirebaseConfigured } from "@/lib/firebase";
import { FullScreen, Spinner } from "@/components/ui";
import { Layout } from "@/components/Layout";
import { SetupNeeded } from "@/pages/SetupNeeded";
import { LoginPage } from "@/pages/Login";
import { LinkEmployeePage } from "@/pages/LinkEmployee";
import { DashboardPage } from "@/pages/Dashboard";
import { SubmitRtmPage } from "@/pages/SubmitRtm";
import { MyRtmsPage } from "@/pages/MyRtms";
import { RulesPage } from "@/pages/Rules";
import { AdminPage } from "@/pages/Admin";

export function App() {
  if (!isFirebaseConfigured) return <SetupNeeded />;
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { firebaseUser, appUser, loading } = useAuth();

  if (loading) {
    return (
      <FullScreen>
        <Spinner className="size-8" />
      </FullScreen>
    );
  }

  if (!firebaseUser || !appUser) return <LoginPage />;

  return (
    <AppDataProvider>
      {appUser.employeeId ? <Shell isAdmin={appUser.role === "admin"} /> : <LinkEmployeePage />}
    </AppDataProvider>
  );
}

function Shell({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/submit" element={<SubmitRtmPage />} />
        <Route path="/me" element={<MyRtmsPage />} />
        <Route path="/rules" element={<RulesPage />} />
        {isAdmin && <Route path="/admin" element={<AdminPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
