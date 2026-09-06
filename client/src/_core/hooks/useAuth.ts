import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

const AUTH_STATE_EVENT = "auth-state-changed";

function readStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem("auth-user");
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  } catch {
    return null;
  }
}

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, loading: true };
  }

  return { user: readStoredUser(), loading: false };
}

/**
 * Lightweight client-side auth state hook.
 *
 * The login flow should store the authenticated user under `auth-user` and
 * dispatch `auth-state-changed`, or replace this storage integration with the
 * project's real session endpoint/provider when one is available.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(getInitialState);

  const refresh = useCallback(() => {
    setState({ user: readStoredUser(), loading: false });
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_STATE_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const logout = useCallback(() => {
    localStorage.removeItem("auth-user");
    window.dispatchEvent(new Event(AUTH_STATE_EVENT));
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    logout,
  };
}

export default useAuth;
