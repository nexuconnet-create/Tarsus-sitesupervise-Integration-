interface BatteryBarProps {
  percent: number;
  showLabel?: boolean;
  className?: string;
}

const BatteryBar = ({ percent, showLabel = true, className = '' }: BatteryBarProps) => {
  const segments = 10;
  const filled = Math.round((percent / 100) * segments);
  const color =
    percent >= 60 ? 'bg-green-500' : percent >= 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-1.5 rounded-sm ${i < filled ? color : 'bg-gray-300'}`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">{percent}%</span>
      )}
    </div>
  );
};

export default BatteryBar;
