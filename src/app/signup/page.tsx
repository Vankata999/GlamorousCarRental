import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignupForm />
    </main>
  );
}
