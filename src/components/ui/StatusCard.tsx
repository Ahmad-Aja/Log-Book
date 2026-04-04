import { LucideIcon, Loader2, AlertCircle } from "lucide-react";

interface StatusCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  loading?: boolean;
  error?: boolean;
}

export function StatusCard({
  title,
  count,
  icon: Icon,
  iconColor,
  bgColor,
  loading = false,
  error = false,
}: StatusCardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-4 border-b-[2px] border-wheat flex flex-col gap-5 justify-between `}
    >
      <div className="flex ">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        ) : error ? (
          <AlertCircle className="w-6 h-6 text-red-500" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
        )}
      </div>
    </div>
  );
}
