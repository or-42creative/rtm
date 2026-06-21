import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/auth";
import { AppDataProvider, useAppData } from "@/lib/appData";
import { isFirebaseConfigured } from "@/lib/firebase";
import { linkEmployeeToUser } from "@/lib/db";
import { FullScreen, Spinner } from "@/components/ui";
import { Layout } from "@/components/Layout";
import { SetupNeeded } from "@/pages/SetupNeeded";
import { LoginPage } from "@/pages/Login";
import { NotLinkedPage } from "@/pages/NotLinked";
import { DashboardPage } from "@/pages/Dashboard";
import { SubmitRtmPage } from "@/pages/SubmitRtm";
import { MyRtmsPage } from "@/pages/MyRtms";
import { RtmDetailPage } from "@/pages/RtmDetail";
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
      <Resolver />
    </AppDataProvider>
  );
}

/**
 * No "who are you?" prompt: we silently link a signed-in account to the employee
 * whose email matches. Admins always get in (so the first one can seed / manage
 * + add people). Everyone else without a match sees the "not on the list" screen.
 */
function Resolver() {
  const { appUser } = useAuth();
  const { employees, loading, t } = useAppData();
  const tried = useRef(false);

  const email = (appUser?.email ?? "").toLowerCase();
  const match = employees.find((e) => (e.email ?? "").toLowerCase() === email && !!email);

  useEffect(() => {
    if (!appUser || appUser.employeeId || !match || tried.current) return;
    tried.current = true;
    void linkEmployeeToUser(appUser.uid, match.id);
  }, [appUser, match]);

  if (!appUser) return null;

  const isAdmin = appUser.role === "admin";
  if (appUser.employeeId || isAdmin) return <Shell isAdmin={isAdmin} />;

  // Still loading employees, or a match was found and the link write is in flight.
  if (loading || match) {
    return (
      <FullScreen>
        <div className="text-center">
          <Spinner className="mx-auto size-8" />
          <p className="mt-3 text-sm font-bold text-[var(--color-ink-soft)]">
            {t("link.resolving")}
          </p>
        </div>
      </FullScreen>
    );
  }

  return <NotLinkedPage />;
}

function Shell({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/submit" element={<SubmitRtmPage />} />
        <Route path="/edit/:id" element={<SubmitRtmPage />} />
        <Route path="/me" element={<MyRtmsPage />} />
        <Route path="/rtm/:id" element={<RtmDetailPage />} />
        <Route path="/rules" element={<RulesPage />} />
        {isAdmin && <Route path="/admin" element={<AdminPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
