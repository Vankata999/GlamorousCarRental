import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Avatar } from "@/components/Avatar";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = session.user.name ?? "User";
  const email = session.user.email ?? "";

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Avatar name={name} email={email} size={96} />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">{email}</p>
        </div>

        <dl className="mt-8 divide-y divide-gray-100 border-t border-gray-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-900">{name}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{email}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
