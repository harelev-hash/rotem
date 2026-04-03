'use client';

interface TopicCardProps {
  emoji: string;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function TopicCard({ emoji, label, color, onClick, disabled }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${color}
        rounded-3xl p-6 flex flex-col items-center justify-center gap-3
        shadow-md active:scale-95 transition-transform duration-150
        min-h-[140px] w-full text-center
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-300
      `}
    >
      <span className="text-5xl leading-none">{emoji}</span>
      <span className="text-xl font-bold text-slate-700">{label}</span>
    </button>
  );
}
