import { forwardRef } from "react";

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
      >
        {children}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

interface AvatarFallbackProps {
  className?: string;
  children?: React.ReactNode;
}

export const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex h-full w-full items-center justify-center rounded-full bg-wheat-light hover:bg-wheat/50 transition-all text-forest-deep ${className ?? ""}`}
      >
        {children}
      </div>
    );
  },
);

AvatarFallback.displayName = "AvatarFallback";
