import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in Session.user type to include:
   * - id: database user ID (cuid)
   * - role: "ADMIN" | "STAFF"
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in User type returned by the authorize() callback.
   */
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the JWT token to carry id and role.
   * These are set in the jwt() callback and read in session().
   */
  interface JWT {
    id: string;
    role: string;
  }
}
