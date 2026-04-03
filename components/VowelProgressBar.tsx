interface VowelProgressBarProps {
  score: number; // 0-100
  color?: string;
}

export default function VowelProgressBar({ score, color = 'bg-blue-500' }: VowelProgressBarProps) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div
        className={`${color} h-3 rounded-full transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
      />
    </div>
  );
}
