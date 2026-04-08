import { ItemsSettingsList } from "@/components/items-settings-list";
import { ShopItem } from "@/types/domain";

export function ItemsManagementPanel({ initialItems }: { initialItems: ShopItem[] }) {
  return <ItemsSettingsList initialItems={initialItems} />;
}
