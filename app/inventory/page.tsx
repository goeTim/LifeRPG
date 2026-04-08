import Link from "next/link";
import { redirect } from "next/navigation";
import { InventoryGrid } from "@/components/inventory-grid";
import { getInventoryForUser } from "@/lib/inventory-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function InventoryPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const inventory = await getInventoryForUser(user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-6 py-8">
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-300">Inventory</p>
          <h1 className="text-3xl font-bold">Dein Inventar</h1>
          <p className="text-sm text-slate-300">Nutze Rewards & Consumables und verwalte Cosmetics/Titles.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/shop">
            Shop
          </Link>
          <Link className="rounded-xl border border-slate-600 px-4 py-2 font-semibold" href="/profile">
            Profil
          </Link>
        </div>
      </div>
      <InventoryGrid initialItems={inventory} />
    </main>
  );
}
