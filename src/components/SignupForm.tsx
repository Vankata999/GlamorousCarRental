"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/actions/auth";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    undefined,
  );

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Sign up to start renting cars.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
