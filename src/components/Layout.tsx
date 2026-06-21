import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/appData";
import { Logo } from "./Logo";
import { NotificationsBell } from "./NotificationsBell";
import { Avatar, Button, cn } from "./ui";

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-full px-4 py-2 text-sm font-bold transition",
    isActive
      ? "bg-[var(--color-brand)] text-white"
      : "text-[var(--color-ink-soft)] hover:bg-[var(--color-cloud)]",
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { appUser, signOut } = useAuth();
  const { employeeName, t } = useAppData();
  const isAdmin = appUser?.role === "admin";
  const myName = appUser?.employeeId
    ? employeeName(appUser.employeeId)
    : (appUser?.displayName ?? "");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/" className="me-auto">
            <Logo size={40} />
          </NavLink>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            <NavLink to="/" end className={navClass}>
              {t("nav.dashboard")}
            </NavLink>
            <NavLink to="/submit" className={navClass}>
              {t("nav.submit")}
            </NavLink>
            <NavLink to="/me" className={navClass}>
              {t("nav.myRtms")}
            </NavLink>
            <NavLink to="/rules" className={navClass}>
              {t("nav.rules")}
            </NavLink>
            <NavLink to="/claim" className={navClass}>
              {t("nav.claim")}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                {t("nav.admin")}
              </NavLink>
            )}
          </nav>

          <div className="order-2 flex items-center gap-2 sm:order-3">
            <div className="hidden text-end sm:block">
              <div className="text-sm font-bold leading-tight">{myName}</div>
              {isAdmin && (
                <div className="text-[11px] font-bold text-[var(--color-accent)]">
                  {t("nav.adminBadge")}
                </div>
              )}
            </div>
            <NotificationsBell />
            <Avatar name={myName} src={appUser?.photoURL} />
            <Button variant="ghost" onClick={() => void signOut()} className="px-2">
              {t("nav.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-[var(--color-ink-soft)]">
        {t("nav.footer")}
      </footer>
    </div>
  );
}
