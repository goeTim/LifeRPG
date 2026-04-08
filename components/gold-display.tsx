import { Coins } from "lucide-react";

export function GoldDisplay({ amount }: { amount: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300">
      <Coins className="h-4 w-4" />
      <span className="font-semibold">{amount} Gold</span>
    </div>
  );
}
