import { GoldDisplay } from "@/components/gold-display";

export function ShopHeader({ gold, points }: { gold: number; points: number }) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-cyan-300">Shop</p>
        <h1 className="text-3xl font-bold">Belohnungen & Items kaufen</h1>
      </div>
      <div className="flex items-center gap-3">
        <GoldDisplay amount={gold} />
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm">⭐ {points} Punkte</div>
      </div>
    </div>
  );
}
