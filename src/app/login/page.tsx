import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
