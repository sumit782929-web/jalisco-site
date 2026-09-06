import { useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type AuthUser = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  role?: string;
  [key: string]: unknown;
};

/**
 * Client-side auth state, backed by the real session cookie set on login
 * (see server/_core/oauth.ts). `auth.me` is a public tRPC query that simply
 * returns the current user (or null) — it never throws, so this is safe to
 * call on every page.
 */
export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user: (meQuery.data as AuthUser | null) ?? null,
    loading: meQuery.isLoading,
    logout,
  };
}

export default useAuth;
