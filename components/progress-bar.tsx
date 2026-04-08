type Props = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: Props) {
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-slate-800 ${className ?? ""}`}>
      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${value}%` }} />
    </div>
  );
}
