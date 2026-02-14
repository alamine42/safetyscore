import type { TrendDirection } from "@/types/model";

type TrendIndicatorProps = {
  trend: TrendDirection;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
};

export function TrendIndicator({ trend, size = "sm" }: TrendIndicatorProps) {
  const cls = sizeClasses[size];

  switch (trend) {
    case "up":
      return (
        <span className={`inline-flex ${cls} text-green-600 dark:text-green-400`} title="Improving">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case "down":
      return (
        <span className={`inline-flex ${cls} text-red-600 dark:text-red-400`} title="Declining">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case "stable":
      return (
        <span className={`inline-flex ${cls} text-muted`} title="Stable">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
          </svg>
        </span>
      );
    case "new":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          NEW
        </span>
      );
  }
}
