import { auth } from "@/lib/auth";
import { type UserRole } from "@prisma/client";

// ─── Server-side auth helpers ────────────────────────────────────────────────

/**
 * Get the current session — throws 401 if not authenticated.
 * Use in Server Components and API Route Handlers.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("Unauthorized", 401);
  }
  return session;
}

/**
 * Require a specific role — throws 403 if role doesn't match.
 * Use to guard Admin-only operations in API routes.
 */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new AuthError(`Forbidden — ${role} access required`, 403);
  }
  return session;
}

/**
 * Require Admin role — convenience wrapper.
 */
export async function requireAdmin() {
  return requireRole("ADMIN" as UserRole);
}

/**
 * Check if user has a specific role — returns boolean, does not throw.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === role;
}

/**
 * Structured auth error with HTTP status code.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }

  toResponse() {
    return Response.json({ error: this.message }, { status: this.status });
  }
}

// ─── RBAC permission matrix ──────────────────────────────────────────────────

type Permission =
  | "product:create"
  | "product:read"
  | "product:update"
  | "product:delete"
  | "supplier:create"
  | "supplier:read"
  | "supplier:update"
  | "supplier:delete"
  | "inventory:create"
  | "inventory:read"
  | "alert:read"
  | "alert:dismiss"
  | "analytics:read"
  | "user:manage";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    "product:create", "product:read", "product:update", "product:delete",
    "supplier:create", "supplier:read", "supplier:update", "supplier:delete",
    "inventory:create", "inventory:read",
    "alert:read", "alert:dismiss",
    "analytics:read",
    "user:manage",
  ],
  STAFF: [
    "product:read", "product:update",
    "supplier:read",
    "inventory:create", "inventory:read",
    "alert:read", "alert:dismiss",
    "analytics:read",
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function can(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Returns all permissions for a role.
 */
export function getPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
