"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { can } from "@/lib/rbac";

type Permission =
  | "product:create" | "product:read" | "product:update" | "product:delete"
  | "supplier:create" | "supplier:read" | "supplier:update" | "supplier:delete"
  | "inventory:create" | "inventory:read"
  | "alert:read" | "alert:dismiss"
  | "analytics:read"
  | "user:manage";

/**
 * Hook to access auth state and RBAC helpers in Client Components.
 *
 * @example
 * const { user, isAdmin, can, logout } = useAuth();
 * if (can("product:delete")) { ... }
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;
  const role = user?.role ?? "";

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return {
    // Session state
    user,
    session,
    status,
    isLoading:       status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",

    // Role checks
    role,
    isAdmin: role === "ADMIN",
    isStaff: role === "STAFF",

    // RBAC permission check
    can: (permission: Permission) => can(role, permission),

    // Actions
    logout,
  };
}
