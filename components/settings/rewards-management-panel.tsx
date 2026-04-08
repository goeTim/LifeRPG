import { RewardsSettingsList } from "@/components/rewards-settings-list";
import { CustomReward } from "@/types/domain";

export function RewardsManagementPanel({ initialRewards }: { initialRewards: CustomReward[] }) {
  return <RewardsSettingsList initialRewards={initialRewards} />;
}
