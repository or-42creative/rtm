import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { subscribeClients, subscribeEmployees, subscribeRtms } from "./db";
import type { Client, Employee, Rtm } from "@/types";

interface AppDataValue {
  employees: Employee[];
  clients: Client[];
  rtms: Rtm[];
  loading: boolean;
  /** id → employee name, "—" when missing. */
  employeeName: (id: string | null | undefined) => string;
  /** Account managers only (those who manage at least one client). */
  accountManagers: Employee[];
  activeEmployees: Employee[];
  activeClients: Client[];
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rtms, setRtms] = useState<Rtm[]>([]);
  const [ready, setReady] = useState({ e: false, c: false, r: false });

  useEffect(() => {
    const unsubE = subscribeEmployees((rows) => {
      setEmployees(rows);
      setReady((s) => (s.e ? s : { ...s, e: true }));
    });
    const unsubC = subscribeClients((rows) => {
      setClients(rows);
      setReady((s) => (s.c ? s : { ...s, c: true }));
    });
    const unsubR = subscribeRtms((rows) => {
      setRtms(rows);
      setReady((s) => (s.r ? s : { ...s, r: true }));
    });
    return () => {
      unsubE();
      unsubC();
      unsubR();
    };
  }, []);

  const value = useMemo<AppDataValue>(() => {
    const names = new Map(employees.map((e) => [e.id, e.name] as const));
    const amIds = new Set(clients.map((c) => c.accountManagerId));
    return {
      employees,
      clients,
      rtms,
      loading: !(ready.e && ready.c && ready.r),
      employeeName: (id) => (id ? (names.get(id) ?? "—") : "—"),
      accountManagers: employees.filter((e) => amIds.has(e.id)),
      activeEmployees: employees.filter((e) => e.active),
      activeClients: clients.filter((c) => c.active),
    };
  }, [employees, clients, rtms, ready]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within <AppDataProvider>");
  return ctx;
}
