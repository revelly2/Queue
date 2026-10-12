import { listModules, listServices } from "@/lib/admin/config";
import { requireAdmin } from "@/lib/auth/admin";
import ModulesAdmin from "./ModulesAdmin";

export const instant = false;

export default async function AdminModulesPage() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-500">Admin access required.</p>
      </main>
    );
  }
  const [modules, services] = await Promise.all([
    listModules(supabase),
    listServices(supabase),
  ]);
  return <ModulesAdmin initialModules={modules} services={services} />;
}
