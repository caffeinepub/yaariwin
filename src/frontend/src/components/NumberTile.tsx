import { cn } from "@/lib/utils";

const BALL_COLORS = [
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-orange-500",
  "bg-purple-600",
  "bg-pink-600",
  "bg-cyan-600",
  "bg-yellow-500",
  "bg-rose-600",
  "bg-indigo-600",
];

interface NumberTileProps {
  number: number;
  selected?: boolean;
  amount?: string;
  onAmountChange?: (val: string) => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showAmount?: boolean;
  isWinner?: boolean;
}

export function NumberTile({
  number,
  selected = false,
  amount = "",
  onAmountChange,
  onClick,
  size = "md",
  disabled = false,
  showAmount = true,
  isWinner = false,
}: NumberTileProps) {
  const colorClass = BALL_COLORS[number];

  const sizeClasses = {
    sm: "w-10 h-10 text-base",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "lottery-ball",
          sizeClasses[size],
          colorClass,
          "text-white font-black relative",
          selected && "selected",
          isWinner && "animate-pulse-gold",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {isWinner && (
          <span className="absolute -top-1 -right-1 text-xs">⭐</span>
        )}
        {number}
      </button>
      {showAmount && onAmountChange && (
        <input
          type="number"
          min="1"
          placeholder="₹"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
          className={cn(
            "w-14 text-center text-sm bg-muted border rounded-md px-1 py-1 text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-gold",
            !selected && "opacity-40",
            disabled && "cursor-not-allowed",
          )}
        />
      )}
    </div>
  );
}
