"use client";

import { InventoryItem } from "@/types/domain";

export function TitleManager({ entry, onToggle, onSetMain }: { entry: InventoryItem; onToggle: (id: string) => void; onSetMain: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-xl border border-violet-600 px-3 py-1 text-sm" onClick={() => onToggle(entry.id)}>
        {entry.is_active ? "Deaktivieren" : "Aktivieren"}
      </button>
      <button className="rounded-xl border border-amber-500 px-3 py-1 text-sm text-amber-300" onClick={() => onSetMain(entry.id)}>
        {entry.is_main_title ? "Haupttitel" : "Als Haupttitel setzen"}
      </button>
    </div>
  );
}
