import { requireAdmin } from "@/lib/auth/admin";
import { listUsers } from "@/lib/admin/users";
import UsersAdmin from "./UsersAdmin";

export const instant = false;

export default async function AdminUsersPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-500">Admin access required.</p>
      </main>
    );
  }
  const users = await listUsers(supabase);
  return <UsersAdmin initialUsers={users} />;
}
