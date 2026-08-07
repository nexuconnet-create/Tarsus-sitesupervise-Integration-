type SignalStrength = 'strong' | 'moderate' | 'weak' | 'none';

interface SignalStrengthBarProps {
  strength: SignalStrength;
  className?: string;
}

const barConfig: Record<SignalStrength, { filled: number; color: string; label: string }> = {
  strong: { filled: 4, color: 'bg-green-500', label: 'Strong' },
  moderate: { filled: 3, color: 'bg-yellow-500', label: 'Moderate' },
  weak: { filled: 2, color: 'bg-orange-500', label: 'Weak' },
  none: { filled: 1, color: 'bg-gray-300', label: 'None' },
};

const SignalStrengthBar = ({ strength, className = '' }: SignalStrengthBarProps) => {
  const config = barConfig[strength];
  const heights = ['h-1.5', 'h-2.5', 'h-3.5', 'h-5'];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-end gap-0.5">
        {heights.map((h, i) => (
          <div
            key={i}
            className={`w-1 ${h} rounded-sm ${i < config.filled ? config.color : 'bg-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </div>
  );
};

export default SignalStrengthBar;
