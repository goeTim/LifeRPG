type Props = {
  value: number;
};

export function ProgressBar({ value }: Props) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${value}%` }} />
    </div>
  );
}
