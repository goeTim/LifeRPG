import { AVATAR_OPTIONS } from "@/lib/constants";

export function AvatarPicker({ selectedAvatar }: { selectedAvatar: string }) {
  return (
    <div className="card space-y-3">
      <h3 className="text-lg font-semibold">Avatar</h3>
      <div className="grid grid-cols-1 gap-3">
        {AVATAR_OPTIONS.map((avatar) => {
          const isActive = avatar.id === selectedAvatar;
          return (
            <div
              key={avatar.id}
              className={`rounded-xl border p-3 ${isActive ? "border-violet-400 bg-violet-500/10" : "border-slate-700 bg-slate-900/40"}`}
            >
              <p className="text-3xl">{avatar.emoji}</p>
              <p className="mt-1 text-sm text-slate-200">{avatar.label}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">Mehr Avatare folgen in einem zukünftigen Update.</p>
    </div>
  );
}
