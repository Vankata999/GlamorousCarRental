"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";

export type AuthState = { error: string } | undefined;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({ data: { name, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // signIn throws a redirect on success — let that propagate.
    if (error instanceof AuthError)
      return { error: "Account created, but sign-in failed. Please log in." };
    throw error;
  }
  return undefined;
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password)
    return { error: "Enter your email and password." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }
  return undefined;
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
