import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor?: string;
  bgColor?: string;
}

export function QuickAccessCard({
  title,
  description,
  icon: Icon,
  href,
  iconColor = "text-wheat",
  bgColor = "bg-wheat/10",
}: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-dark transition-all duration-300 cursor-pointer group flex items-center gap-4">
        <div
          className={`w-10 h-10 shrink-0 ${bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </Link>
  );
}
