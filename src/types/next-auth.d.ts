import type { DefaultSession } from "next-auth";

// Add the user id to the session type so auth() exposes it everywhere.
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
