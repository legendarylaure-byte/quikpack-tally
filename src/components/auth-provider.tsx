"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAuthClient, getDb, isFirebaseConfigured } from "@/lib/firebase";
import { MAIN_COMPANY_ID, toMembership, type Membership } from "@/lib/permissions";

interface AuthState {
  user: User | null;
  claims: Record<string, unknown>;
  membership: Membership | null;
  status: "loading" | "loading-membership" | "ready";
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  membership: Membership | null;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    claims: {},
    membership: null,
    status: isFirebaseConfigured ? "loading" : "ready",
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    let disposed = false;
    let unsubscribeMembership: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(getAuthClient(), async (nextUser) => {
      unsubscribeMembership?.();
      unsubscribeMembership = undefined;

      if (disposed) {
        return;
      }

      if (!nextUser) {
        setState({ user: null, claims: {}, membership: null, status: "ready" });
        return;
      }

      const tokenResult = await nextUser.getIdTokenResult();
      if (disposed) {
        return;
      }

      setState({
        user: nextUser,
        claims: tokenResult.claims,
        membership: null,
        status: "loading-membership",
      });

      const membershipRef = doc(
        getDb(),
        "companyUsers",
        MAIN_COMPANY_ID,
        "users",
        nextUser.uid,
      );

      unsubscribeMembership = onSnapshot(
        membershipRef,
        (snapshot) => {
          if (disposed) {
            return;
          }
          setState((current) =>
            current.user?.uid === nextUser.uid
              ? {
                  ...current,
                  membership: snapshot.exists()
                    ? toMembership(snapshot.data())
                    : null,
                  status: "ready",
                }
              : current,
          );
        },
        () => {
          if (disposed) {
            return;
          }
          setState((current) =>
            current.user?.uid === nextUser.uid
              ? { ...current, membership: null, status: "ready" }
              : current,
          );
        },
      );
    });

    return () => {
      disposed = true;
      unsubscribeAuth();
      unsubscribeMembership?.();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: state.user,
      loading: state.status !== "ready",
      configured: isFirebaseConfigured,
      isAdmin: state.claims.admin === true,
      membership: state.membership,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
