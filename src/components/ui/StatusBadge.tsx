export type StatusBadgeColor =
  | "green"
  | "yellow"
  | "red"
  | "gray"
  | "blue"
  | "orange"
  | "purple";

const colorClasses: Record<StatusBadgeColor, string> = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  red: "bg-red-100 text-red-800 border-red-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

interface StatusBadgeProps {
  color: StatusBadgeColor;
  label: string;
  size?: "sm" | "md";
}

export function StatusBadge({ color, label, size = "sm" }: StatusBadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${colorClasses[color]} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}
