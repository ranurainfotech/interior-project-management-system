"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getAllProjectParties } from "@/lib/firestore/project-parties";
import { getParties } from "@/lib/firestore/parties";
import { getProjects } from "@/lib/firestore/projects";
import { getTransactions } from "@/lib/firestore/transactions";
import { PageLoading } from "@/components/layout/page-loading";
import { getFirestoreErrorMessage } from "@/lib/firebase-errors";
import { toast } from "sonner";
import type { Party, Project, ProjectParty, Transaction } from "@/types";

interface UserDataContextValue {
  projects: Project[];
  parties: Party[];
  transactions: Transaction[];
  projectParties: ProjectParty[];
  ready: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projectParties, setProjectParties] = useState<ProjectParty[]>([]);
  const [ready, setReady] = useState(false);
  const fetchIdRef = useRef(0);

  const load = useCallback(async (userId: string, fetchId: number) => {
    const [projs, pts, txns, pps] = await Promise.all([
      getProjects(userId),
      getParties(userId),
      getTransactions(userId),
      getAllProjectParties(userId),
    ]);

    if (fetchId !== fetchIdRef.current) return;

    setProjects(projs);
    setParties(pts);
    setTransactions(txns);
    setProjectParties(pps);
    setReady(true);
  }, []);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!user) return;
    const fetchId = ++fetchIdRef.current;
    try {
      await load(user.uid, fetchId);
    } catch (error) {
      if (!options?.silent) {
        toast.error(getFirestoreErrorMessage(error));
      }
    }
  }, [user, load]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      fetchIdRef.current += 1;
      setProjects([]);
      setParties([]);
      setTransactions([]);
      setProjectParties([]);
      setReady(false);
      return;
    }

    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    (async () => {
      try {
        await load(user.uid, fetchId);
      } catch (error) {
        if (!cancelled) toast.error(getFirestoreErrorMessage(error));
      } finally {
        if (!cancelled && fetchId === fetchIdRef.current) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, load]);

  if (!ready) {
    return <PageLoading fullScreen />;
  }

  return (
    <UserDataContext.Provider
      value={{
        projects,
        parties,
        transactions,
        projectParties,
        ready,
        refresh,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
}
