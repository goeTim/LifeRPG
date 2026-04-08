import { CustomReward, InventoryItem, ShopItem, ShopItemType } from "@/types/domain";

export function canAfford(params: { gold: number; points: number; costGold: number; costPoints?: number }) {
  const neededPoints = params.costPoints ?? 0;
  return params.gold >= params.costGold && params.points >= neededPoints;
}

export function deductWallet(params: { gold: number; points: number; costGold: number; costPoints?: number }) {
  return {
    gold: Math.max(0, params.gold - params.costGold),
    points: Math.max(0, params.points - (params.costPoints ?? 0))
  };
}

export function isItemStackable(itemType: ShopItemType) {
  return itemType === "consumable";
}

export function isItemConsumable(itemType: ShopItemType) {
  return itemType === "consumable";
}

export function getInventoryMeta(entry: InventoryItem) {
  if (entry.reward) {
    return {
      kind: "reward" as const,
      type: "reward",
      name: entry.reward.name,
      description: entry.reward.description,
      icon: entry.reward.icon ?? "🎁",
      consumable: true,
      stackable: true,
      quantityLabel: "x"
    };
  }

  const item = entry.shop_item as ShopItem | null;
  if (!item) {
    return {
      kind: "unknown" as const,
      type: "unknown",
      name: "Unbekannt",
      description: null,
      icon: "❓",
      consumable: false,
      stackable: false,
      quantityLabel: ""
    };
  }

  return {
    kind: "shop_item" as const,
    type: item.item_type,
    name: item.name,
    description: item.description,
    icon: item.icon ?? "✨",
    consumable: item.is_consumable,
    stackable: item.is_stackable,
    quantityLabel: "x"
  };
}

export function toPurchasableView(reward: CustomReward | null, item: ShopItem | null) {
  if (reward) {
    return {
      id: reward.id,
      kind: "reward" as const,
      name: reward.name,
      description: reward.description,
      icon: reward.icon ?? "🎁",
      cost_gold: reward.cost_gold,
      cost_points: reward.cost_points,
      type: "reward"
    };
  }

  if (!item) return null;
  return {
    id: item.id,
    kind: "item" as const,
    name: item.name,
    description: item.description,
    icon: item.icon ?? "✨",
    cost_gold: item.cost_gold,
    cost_points: item.cost_points,
    type: item.item_type
  };
}
