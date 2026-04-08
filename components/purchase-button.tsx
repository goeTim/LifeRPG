"use client";

export function PurchaseButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} className="btn-primary w-full" onClick={onClick}>
      Kaufen
    </button>
  );
}
